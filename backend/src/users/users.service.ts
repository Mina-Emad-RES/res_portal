import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
// import { Role } from '../../generated/prisma';
import { Prisma, Role } from '@prisma/client';
import {
  handlePrismaNotFound,
  handlePrismaUniqueViolation,
} from '../common/prisma/prisma-errors';
import * as crypto from 'crypto';

const userSelect = {
  id: true,
  username: true,
  role: true,
  isActive: true,
  passwordSetupToken: true,
  passwordSetupExpires: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    try {
      const user = await this.databaseService.user.create({
        data: {
          username: createUserDto.username,
          role: createUserDto.role,
          passwordSetupToken: tokenHash,
          passwordSetupExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        select: userSelect,
      });

      return {
        user,
        setupToken: rawToken,
      };
    } catch (error) {
      handlePrismaUniqueViolation(error, 'User already exists');
    }
  }

  async findAll() {
    return await this.databaseService.user.findMany({
      select: userSelect,
    });
  }

  async findClients() {
    return await this.databaseService.user.findMany({
      where: {
        role: Role.CLIENT,
        isActive: true,
      },
      select: {
        id: true,
        username: true, // only expose these two
      },
      orderBy: {
        username: 'asc',
      },
    });
  }

  async findOne(id: string, requester: JwtPayload) {
    if (requester.role !== Role.ADMIN && requester.id !== id) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.databaseService.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: UpdateUserDto = { ...updateUserDto };
    try {
      return await this.databaseService.user.update({
        where: { id },
        data,
        select: userSelect,
      });
    } catch (error) {
      handlePrismaNotFound(error, 'User not found');
    }
  }

  async findByUsername(username: string) {
    return await this.databaseService.user.findUnique({
      where: { username },
    });
  }

  async remove(id: string) {
    try {
      return await this.databaseService.user.delete({
        where: { id },
        select: userSelect,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This user cannot be deleted because they are linked to existing reports. Please deactivate the user instead.',
        );
      }

      handlePrismaNotFound(error, 'User not found');
      throw error;
    }
  }

  async findByPasswordSetupToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    return this.databaseService.user.findFirst({
      where: {
        passwordSetupToken: tokenHash,
        passwordSetupExpires: { gt: new Date() },
      },
    });
  }

  async activateUserPassword(userId: string, hashedPassword: string) {
    return this.databaseService.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordSetupToken: null,
        passwordSetupExpires: null,
      },
    });
  }

  async regeneratePasswordSetupToken(userId: string) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const user = await this.databaseService.user.update({
      where: { id: userId },
      data: {
        passwordSetupToken: tokenHash,
        passwordSetupExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        username: true,
      },
    });

    return {
      user,
      setupToken: rawToken,
    };
  }
}

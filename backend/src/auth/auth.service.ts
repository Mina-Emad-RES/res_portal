import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

type AuthUser = {
  id: string;
  password: string | null;
  role: Role;
  isActive: boolean;
};

type JwtPayload = {
  id: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<AuthUser> {
    const user = await this.usersService.findByUsername(username);

    if (!user || !user.isActive || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  login(user: AuthUser) {
    const payload: JwtPayload = {
      id: user.id,
      role: user.role,
    };

    return {
      user: {
        id: user.id,
        role: user.role,
        isActive: user.isActive,
        // you can include other safe fields here (NOT password)
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async validatePasswordSetupToken(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    const user = await this.usersService.findByPasswordSetupToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { valid: true, username: user.username };
  }

  async setPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordSetupToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.activateUserPassword(user.id, hashedPassword);

    return { message: 'Password set successfully' };
  }
}

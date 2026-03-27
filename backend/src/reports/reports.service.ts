import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { DatabaseService } from '../database/database.service';
import { JwtPayload } from '../auth/jwt-payload.interface';
import { Role, ReportType, Prisma } from '@prisma/client';

import {
  handlePrismaNotFound,
  handlePrismaUniqueViolation,
} from '../common/prisma/prisma-errors';
import { UpdateReportDto } from './dto/update-report.dto';

const reportSelect = Prisma.validator<Prisma.ReportSelect>()({
  id: true,
  type: true,
  clientId: true,
  createdById: true,
  reportDate: true,
  content: true,
  createdAt: true,

  client: {
    select: {
      id: true,
      username: true,
    },
  },

  createdBy: {
    select: {
      id: true,
      username: true,
    },
  },
});

@Injectable()
export class ReportsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createReportDto: CreateReportDto, requester: JwtPayload) {
    const { role, id: userId } = requester;

    if (role !== Role.ADMIN) {
      if (role === Role.CLIENT) {
        throw new ForbiddenException('Clients cannot create reports');
      }

      const allowedType = this.roleReportMap[role];

      if (!allowedType || createReportDto.type !== allowedType) {
        throw new ForbiddenException(
          `You can only create ${allowedType} reports`,
        );
      }
    }

    try {
      return await this.databaseService.report.create({
        data: {
          type: createReportDto.type,
          clientId: createReportDto.clientId,
          reportDate: new Date(`${createReportDto.reportDate}T00:00:00`),
          content: createReportDto.content,
          createdById: userId,
        },
        select: reportSelect,
      });
    } catch (error) {
      handlePrismaUniqueViolation(
        error,
        'Report already exists for this client/date/type',
      );
    }
  }

  roleReportMap: Partial<Record<Role, ReportType>> = {
    [Role.AUDITOR]: ReportType.AUDIT,
    [Role.DM]: ReportType.DM,
  };

  async findAll(requester: JwtPayload) {
    const where: Prisma.ReportWhereInput = {};

    if (requester.role === Role.CLIENT) {
      where.clientId = requester.id;
    }

    const reportType = this.roleReportMap[requester.role];
    if (reportType) {
      where.type = reportType;
    }

    return this.databaseService.report.findMany({
      where,
      select: reportSelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, requester: JwtPayload) {
    const report = await this.databaseService.report.findUnique({
      where: { id },
      select: reportSelect,
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (requester.role === Role.ADMIN) {
      return report;
    }

    if (requester.role === Role.CLIENT) {
      if (report.clientId !== requester.id) {
        throw new ForbiddenException('Access denied');
      }
      return report;
    }

    const expectedType = this.roleReportMap[requester.role];

    if (expectedType && report.type !== expectedType) {
      throw new ForbiddenException('Access denied');
    }

    return report;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    requester: JwtPayload,
  ) {
    const report = await this.databaseService.report.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        clientId: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Admin can update anything
    if (requester.role === Role.ADMIN) {
      return this.databaseService.report.update({
        where: { id },
        data: {
          ...updateReportDto,
          reportDate: new Date(`${updateReportDto.reportDate}T00:00:00`),
        },
        select: reportSelect,
      });
    }

    // Clients cannot update
    if (requester.role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot update reports');
    }

    // Role-based update
    const allowedType = this.roleReportMap[requester.role];
    if (allowedType && report.type !== allowedType) {
      throw new ForbiddenException('You cannot update this report type');
    }

    try {
      return await this.databaseService.report.update({
        where: { id },
        data: {
          ...updateReportDto,
          reportDate: new Date(`${updateReportDto.reportDate}T00:00:00`),
        },
        select: reportSelect,
      });
    } catch (error) {
      handlePrismaNotFound(error, 'Report not found');
    }
  }

  async remove(id: string, requester: JwtPayload) {
    const report = await this.databaseService.report.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        clientId: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Admin can delete anything
    if (requester.role === Role.ADMIN) {
      return this.databaseService.report.delete({
        where: { id },
        select: reportSelect,
      });
    }

    // Clients cannot delete reports
    if (requester.role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot delete reports');
    }

    // Role-based deletion
    const allowedType = this.roleReportMap[requester.role];

    if (allowedType && report.type !== allowedType) {
      throw new ForbiddenException('You cannot delete this report type');
    }

    try {
      return await this.databaseService.report.delete({
        where: { id },
        select: reportSelect,
      });
    } catch (error) {
      handlePrismaNotFound(error, 'Report not found');
    }
  }
}

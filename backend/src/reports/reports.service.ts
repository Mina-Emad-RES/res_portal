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
import {
  FindReportsQueryDto,
  ReportSortField,
  ReportSortOrder,
} from './dto/find-reports-query.dto';

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

// Maps a whitelisted sort field -> a Prisma orderBy fragment.
// `client` / `createdBy` sort by the related user's username (a JOIN).
const SORT_FIELD_BUILDERS: Record<
  ReportSortField,
  (dir: Prisma.SortOrder) => Prisma.ReportOrderByWithRelationInput
> = {
  [ReportSortField.TYPE]: (dir) => ({ type: dir }),
  [ReportSortField.REPORT_DATE]: (dir) => ({ reportDate: dir }),
  [ReportSortField.CREATED_AT]: (dir) => ({ createdAt: dir }),
  [ReportSortField.CLIENT]: (dir) => ({ client: { username: dir } }),
  [ReportSortField.CREATED_BY]: (dir) => ({ createdBy: { username: dir } }),
};

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

  // Builds a deterministic orderBy for cursor pagination. The unique `id`
  // tiebreaker is ALWAYS appended (matching the chosen direction) so the
  // cursor seek never skips/duplicates rows, regardless of sort column.
  private buildOrderBy(
    query: FindReportsQueryDto,
  ): Prisma.ReportOrderByWithRelationInput[] {
    const dir: Prisma.SortOrder =
      query.sortOrder === ReportSortOrder.ASC ? 'asc' : 'desc';

    if (query.sortBy && SORT_FIELD_BUILDERS[query.sortBy]) {
      return [SORT_FIELD_BUILDERS[query.sortBy](dir), { id: dir }];
    }

    // Default ordering (unchanged from before).
    return [{ createdAt: 'desc' }, { id: 'desc' }];
  }

  async findAll(requester: JwtPayload, query: FindReportsQueryDto) {
    const where: Prisma.ReportWhereInput = {};
    const limit = Math.min(query.limit ?? 50, 100);

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.createdById) {
      where.createdById = query.createdById;
    }

    if (query.reportDate) {
      where.reportDate = new Date(`${query.reportDate}T00:00:00`);
    }

    // Role-based overrides (these always win over user filters)
    if (requester.role === Role.CLIENT) {
      where.clientId = requester.id;
    }

    const roleReportType = this.roleReportMap[requester.role];
    if (roleReportType) {
      where.type = roleReportType;
    }

    const records = await this.databaseService.report.findMany({
      where,
      select: reportSelect,
      orderBy: this.buildOrderBy(query),
      take: limit + 1,
      ...(query.cursor && {
        skip: 1,
        cursor: { id: query.cursor },
      }),
    });

    const hasMore = records.length > limit;
    const items = hasMore ? records.slice(0, limit) : records;
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasMore,
    };
  }

  async findFilterOptions(requester: JwtPayload, clientId?: string) {
    const where: Prisma.ReportWhereInput = {};

    if (clientId) {
      where.clientId = clientId;
    }

    // Role-based scoping (overrides user-supplied clientId for CLIENT)
    if (requester.role === Role.CLIENT) {
      where.clientId = requester.id;
    }

    const roleReportType = this.roleReportMap[requester.role];
    if (roleReportType) {
      where.type = roleReportType;
    }

    const availableTypes: ReportType[] = roleReportType
      ? [roleReportType]
      : [ReportType.AUDIT, ReportType.DM];

    const dateRecords = await this.databaseService.report.findMany({
      where,
      select: { reportDate: true },
      distinct: ['reportDate'],
      orderBy: { reportDate: 'desc' },
    });

    const availableDates = dateRecords.map((r) =>
      r.reportDate.toISOString().slice(0, 10),
    );

    let creatorRoles: Role[];
    if (requester.role === Role.AUDITOR) {
      creatorRoles = [Role.ADMIN, Role.AUDITOR];
    } else if (requester.role === Role.DM) {
      creatorRoles = [Role.ADMIN, Role.DM];
    } else {
      creatorRoles = [Role.ADMIN, Role.AUDITOR, Role.DM];
    }

    const creators = await this.databaseService.user.findMany({
      where: { role: { in: creatorRoles } },
      select: {
        id: true,
        username: true,
        role: true,
      },
      orderBy: { username: 'asc' },
    });

    return {
      availableTypes,
      availableDates,
      creators,
    };
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

    if (requester.role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot update reports');
    }

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

    if (requester.role === Role.ADMIN) {
      return this.databaseService.report.delete({
        where: { id },
        select: reportSelect,
      });
    }

    if (requester.role === Role.CLIENT) {
      throw new ForbiddenException('Clients cannot delete reports');
    }

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

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
  Query,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthRequest } from '../auth/auth-request.interface';
import { UpdateReportDto } from './dto/update-report.dto';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.AUDITOR, Role.DM)
  create(@Body() createReportDto: CreateReportDto, @Req() req: AuthRequest) {
    return this.reportsService.create(createReportDto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.CLIENT, Role.AUDITOR, Role.DM)
  findAll(@Query() query: FindReportsQueryDto, @Req() req: AuthRequest) {
    return this.reportsService.findAll(req.user, query);
  }

  // Must come before @Get(':id') so it isn't matched as an id
  @Get('filter-options')
  @Roles(Role.ADMIN, Role.CLIENT, Role.AUDITOR, Role.DM)
  getFilterOptions(
    @Req() req: AuthRequest,
    @Query('clientId') clientId?: string,
  ) {
    return this.reportsService.findFilterOptions(req.user, clientId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CLIENT, Role.AUDITOR, Role.DM)
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.reportsService.findOne(id, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.DM)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.reportsService.remove(id, req.user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.DM)
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: AuthRequest,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthRequest } from '../auth/auth-request.interface';
import { UpdateReportDto } from './dto/update-report.dto';

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
  findAll(@Req() req: AuthRequest) {
    const user = req.user;
    return this.reportsService.findAll(user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CLIENT, Role.AUDITOR, Role.DM)
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const user = req.user;
    return this.reportsService.findOne(id, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.DM)
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    const user = req.user;
    return this.reportsService.remove(id, user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.AUDITOR, Role.DM)
  update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Req() req: AuthRequest,
  ) {
    const user = req.user;
    return this.reportsService.update(id, updateReportDto, user);
  }
}

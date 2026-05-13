import { Controller, Query, Get } from '@nestjs/common';
import { ExternalService } from './external.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Get('campaign/summary')
  @Roles(Role.ADMIN, Role.CLIENT)
  async getDialerSummary(
    @Query('campaign') campaign: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.externalService.getDialerSummary(campaign, startDate, endDate);
  }

  @Get('campaign/logs')
  @Roles(Role.ADMIN, Role.CLIENT)
  async getCallLogs(
    @Query('campaign') campaign: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.externalService.getCallLogs(campaign, startDate, endDate);
  }
}

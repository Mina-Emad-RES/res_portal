import { IsEnum, IsUUID, IsDateString, IsObject } from 'class-validator';
import { ReportType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportType)
  type: ReportType;

  @IsUUID()
  clientId: string;

  @IsDateString()
  reportDate: string;

  @IsObject()
  content: Record<string, any>;
}

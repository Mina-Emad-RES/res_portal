import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '@prisma/client';

// Whitelisted sortable columns. The string values are exactly what the
// frontend sends in ?sortBy=... (see SORT_COLUMNS on the Dashboard).
export enum ReportSortField {
  TYPE = 'type',
  CLIENT = 'client',
  CREATED_BY = 'createdBy',
  REPORT_DATE = 'reportDate',
  CREATED_AT = 'createdAt',
}

export enum ReportSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindReportsQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @IsDateString()
  reportDate?: string;

  @IsOptional()
  @IsEnum(ReportSortField)
  sortBy?: ReportSortField;

  @IsOptional()
  @IsEnum(ReportSortOrder)
  sortOrder?: ReportSortOrder;
}

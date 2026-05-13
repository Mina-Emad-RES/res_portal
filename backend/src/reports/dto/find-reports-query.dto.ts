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
}

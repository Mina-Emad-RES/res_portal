import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  isActive?: boolean;
}

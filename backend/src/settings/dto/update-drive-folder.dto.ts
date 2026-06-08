import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDriveFolderDto {
  @IsString()
  @IsNotEmpty()
  driveFolderId: string;
}

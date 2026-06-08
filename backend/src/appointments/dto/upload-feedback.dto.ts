import { IsOptional, IsString } from 'class-validator';

export class UploadFeedbackDto {
  // Only used by admins, who pick the target client. Ignored for clients,
  // who always upload to their own folder.
  @IsOptional()
  @IsString()
  clientId?: string;
}

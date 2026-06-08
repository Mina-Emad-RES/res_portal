import { Body, Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateDriveFolderDto } from './dto/update-drive-folder.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('drive-folder-id')
  @Roles(Role.ADMIN)
  async getDriveFolderId() {
    const driveFolderId = await this.settingsService.getDriveFolderId();
    return { driveFolderId };
  }

  @Put('drive-folder-id')
  @Roles(Role.ADMIN)
  async updateDriveFolderId(@Body() dto: UpdateDriveFolderDto) {
    return this.settingsService.setDriveFolderId(dto.driveFolderId);
  }
}

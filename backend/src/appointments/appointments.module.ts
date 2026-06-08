import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { DriveModule } from '../drive/drive.module';
import { SettingsModule } from '../settings/settings.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DriveModule, SettingsModule, DatabaseModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}

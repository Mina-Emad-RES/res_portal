import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppointmentsService } from './appointments.service';
import type { UploadedFile as UploadedFileType } from './appointments.service';
import { UploadFeedbackDto } from './dto/upload-feedback.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthRequest } from '../auth/auth-request.interface';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('upload')
  @Roles(Role.CLIENT, Role.ADMIN)
  // No `storage` option => memory storage => file.buffer is available.
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
    }),
  )
  uploadFeedback(
    @Req() req: AuthRequest,
    @UploadedFile() file: UploadedFileType,
    @Body() dto: UploadFeedbackDto,
  ) {
    return this.appointmentsService.uploadFeedback(
      req.user,
      file,
      dto.clientId,
    );
  }
}

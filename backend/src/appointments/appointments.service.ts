import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { DriveService } from '../drive/drive.service';
import { SettingsService } from '../settings/settings.service';
import { JwtPayload } from '../auth/jwt-payload.interface';

const ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls', 'txt'];

// Browsers are inconsistent with csv/xlsx mime types, so we accept a
// permissive set and rely on the extension check as the real gate.
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/octet-stream',
];

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly driveService: DriveService,
    private readonly settingsService: SettingsService,
  ) {}

  private validateFile(file?: UploadedFile) {
    if (!file) throw new BadRequestException('No file uploaded');

    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (!extOk || !mimeOk) {
      throw new BadRequestException(
        'Only CSV, Excel (.xlsx, .xls), or text (.txt) files are allowed',
      );
    }
  }

  // Clients always resolve to themselves; admins must supply a clientId.
  private async resolveTargetClient(requester: JwtPayload, clientId?: string) {
    const targetId = requester.role === Role.ADMIN ? clientId : requester.id;

    if (!targetId) {
      throw new BadRequestException('A client must be selected');
    }

    const user = await this.databaseService.user.findUnique({
      where: { id: targetId },
      select: { id: true, username: true, role: true },
    });

    if (!user) throw new NotFoundException('Client not found');

    // Defense in depth: a non-admin can never target someone else.
    if (requester.role !== Role.ADMIN && user.id !== requester.id) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role !== Role.CLIENT) {
      throw new BadRequestException('Files can only be uploaded for clients');
    }

    return user;
  }

  async uploadFeedback(
    requester: JwtPayload,
    file: UploadedFile | undefined,
    clientId?: string,
  ) {
    this.validateFile(file);

    const client = await this.resolveTargetClient(requester, clientId);
    const rootFolderId = await this.settingsService.requireDriveFolderId();

    const clientFolderId = await this.driveService.findOrCreateFolder(
      rootFolderId,
      client.username,
    );

    await this.driveService.uploadFile(
      clientFolderId,
      file!.buffer,
      file!.originalname,
      file!.mimetype,
    );

    // Nothing about the file is persisted, per requirements.
    return {
      success: true,
      filename: file!.originalname,
      client: client.username,
    };
  }
}

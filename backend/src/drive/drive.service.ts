import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

@Injectable()
export class DriveService {
  private drive: drive_v3.Drive;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Returns the id of a subfolder named `name` under `parentId`,
  // creating it if it doesn't already exist.
  async findOrCreateFolder(parentId: string, name: string): Promise<string> {
    const escapedName = name.replace(/'/g, "\\'");

    const res = await this.drive.files.list({
      q: [
        `'${parentId}' in parents`,
        `name = '${escapedName}'`,
        `mimeType = '${FOLDER_MIME}'`,
        'trashed = false',
      ].join(' and '),
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const existing = res.data.files?.[0];
    if (existing?.id) return existing.id;

    const created = await this.drive.files.create({
      requestBody: {
        name,
        mimeType: FOLDER_MIME,
        parents: [parentId],
      },
      fields: 'id',
      supportsAllDrives: true,
    });

    if (!created.data.id) {
      throw new InternalServerErrorException('Failed to create Drive folder');
    }
    return created.data.id;
  }

  async uploadFile(
    folderId: string,
    buffer: Buffer,
    filename: string,
    mimeType: string,
  ) {
    const res = await this.drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
      },
      media: {
        mimeType,
        body: Readable.from(buffer),
      },
      fields: 'id, name',
      supportsAllDrives: true,
    });

    return res.data;
  }
}

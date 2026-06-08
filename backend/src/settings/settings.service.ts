import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const DRIVE_FOLDER_ID_KEY = 'drive_folder_id';

@Injectable()
export class SettingsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // --- Generic key/value access (so new settings need no migration) ---

  async get(key: string): Promise<string | null> {
    const setting = await this.databaseService.appSetting.findUnique({
      where: { key },
    });
    return setting?.value ?? null;
  }

  async set(key: string, value: string) {
    return this.databaseService.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // --- Drive folder helpers ---

  async getDriveFolderId(): Promise<string | null> {
    return this.get(DRIVE_FOLDER_ID_KEY);
  }

  async setDriveFolderId(value: string) {
    const trimmed = value.trim();
    await this.set(DRIVE_FOLDER_ID_KEY, trimmed);
    return { driveFolderId: trimmed };
  }

  // Used server-side by the appointments flow. Throws if not configured.
  async requireDriveFolderId(): Promise<string> {
    const id = await this.getDriveFolderId();
    if (!id) {
      throw new NotFoundException(
        'Drive folder ID is not configured. Set it in Admin → Settings.',
      );
    }
    return id;
  }
}

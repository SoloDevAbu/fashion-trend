import path from 'path';
import fs   from 'fs/promises';
import type { ProductSource } from '../crawler/crawler.types';

export interface ImageSaveMetadata {
  source:     ProductSource;
  externalId: string;
  imageUrl:   string;
}

export interface IImageStorage {
  save(buffer: Buffer, metadata: ImageSaveMetadata): Promise<string>;
}

const STORAGE_ROOT = process.env['STORAGE_PATH'] ?? './storage/images';

export class LocalImageStorage implements IImageStorage {
  async save(buffer: Buffer, meta: ImageSaveMetadata): Promise<string> {
    const dir = path.join(STORAGE_ROOT, meta.source);
    await fs.mkdir(dir, { recursive: true });

    const ext      = this.getExtension(meta.imageUrl);
    const filename = `${meta.externalId}-${Date.now()}${ext}`;
    const filePath = path.join(dir, filename);

    await fs.writeFile(filePath, buffer);
    return filePath;
  }

  private getExtension(url: string): string {
    const match = (url.split('?')[0] ?? '').match(/\.(jpg|jpeg|png|webp)$/i);
    return match ? `.${match[1]!.toLowerCase()}` : '.jpg';
  }
}

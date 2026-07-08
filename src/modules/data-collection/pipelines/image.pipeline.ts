import type { IPipeline } from './dedupe.pipeline';
import type { PipelineContext } from '../crawler/crawler.types';
import type { IDownloadService } from '../storage/download.service';
import type { IImageStorage } from '../storage/image.storage';
import { logger } from '../../../lib/logger';

export class ImagePipeline implements IPipeline {
  readonly name = 'ImagePipeline';

  constructor(
    private readonly downloader: IDownloadService,
    private readonly storage: IImageStorage,
  ) {}

  async execute(ctx: PipelineContext): Promise<void> {
    logger.info({ source: ctx.source, count: ctx.products.length }, 'ImagePipeline started');

    for (const product of ctx.products) {
      if (product.localImagePath) continue;

      try {
        const buffer    = await this.downloader.download(product.imageUrl, product.source);
        const localPath = await this.storage.save(buffer, {
          source:     product.source,
          externalId: product.externalId,
          imageUrl:   product.imageUrl,
        });

        product.localImagePath = localPath;
      } catch (err) {
        logger.warn({ imageUrl: product.imageUrl, error: String(err) }, 'Image download failed, skipping');
      }
    }
  }
}

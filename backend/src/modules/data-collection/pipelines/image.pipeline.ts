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
      if (product.cloudinaryUrl || !product.imageUrl) continue;

      try {
        // Use a pre-fetched buffer if provided (e.g. Ajio browser-context fetch),
        // otherwise fall back to the axios downloader.
        const buffer = product.imageBuffer
          ?? await this.downloader.download(product.imageUrl, product.source);

        // Free memory once uploaded
        delete product.imageBuffer;

        const cloudinaryUrl = await this.storage.save(buffer, {
          source:     product.source,
          externalId: product.externalId,
          imageUrl:   product.imageUrl,
        });

        product.cloudinaryUrl = cloudinaryUrl;
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response?.status;
        logger.warn(
          { source: product.source, imageUrl: product.imageUrl, status, error: String(err) },
          'Image upload failed, using original URL as fallback',
        );
        // Fallback: store the original image URL so the product has a displayable image
        product.cloudinaryUrl = product.imageUrl;
      }
    }
  }
}

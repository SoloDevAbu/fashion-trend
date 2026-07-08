import axios from 'axios';
import type { ProductSource } from '../crawler/crawler.types';

export interface IDownloadService {
  download(imageUrl: string, source: ProductSource): Promise<Buffer>;
}

const SOURCE_REFERERS: Record<ProductSource, string> = {
  myntra:    'https://www.myntra.com',
  ajio:      'https://www.ajio.com',
  pinterest: 'https://in.pinterest.com',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

export class AxiosDownloadService implements IDownloadService {
  async download(imageUrl: string, source: ProductSource): Promise<Buffer> {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: 'arraybuffer',
      timeout:      15_000,
      headers: {
        'User-Agent': USER_AGENT,
        'Referer':    SOURCE_REFERERS[source],
      },
    });

    return Buffer.from(response.data);
  }
}

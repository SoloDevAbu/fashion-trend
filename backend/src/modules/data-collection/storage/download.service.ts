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

const SOURCE_EXTRA_HEADERS: Partial<Record<ProductSource, Record<string, string>>> = {
  ajio: {
    Origin:           'https://www.ajio.com',
    Accept:           'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    'Sec-Fetch-Dest': 'image',
    'Sec-Fetch-Mode': 'no-cors',
    'Sec-Fetch-Site': 'same-site',
  },
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
        ...SOURCE_EXTRA_HEADERS[source],
      },
    });

    return Buffer.from(response.data);
  }
}

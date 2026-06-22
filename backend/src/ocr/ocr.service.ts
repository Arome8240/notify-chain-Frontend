import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { OcrWorkerPool } from './ocr-worker.pool';

export class OcrTimeoutError extends RequestTimeoutException {
  constructor() {
    super('OCR recognition timed out after 30 seconds');
  }
}

const TIMEOUT_MS = 30_000;

@Injectable()
export class OcrService {
  constructor(private readonly pool: OcrWorkerPool) {}

  async recognize(imageBuffer: Buffer): Promise<string> {
    const worker = await this.pool.acquire();
    if (!worker) {
      throw new Error('No OCR worker available');
    }

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new OcrTimeoutError()), TIMEOUT_MS),
    );

    try {
      const result = await Promise.race([
        worker.recognize(imageBuffer),
        timeout,
      ]);
      return result.data.text;
    } finally {
      this.pool.release(worker);
    }
  }
}

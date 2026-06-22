import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OcrWorkerPool } from './ocr-worker.pool';

@Injectable()
export class OcrQueueService {
  constructor(
    @InjectQueue('ocr') private readonly ocrQueue: Queue,
    private readonly pool: OcrWorkerPool,
  ) {}

  async enqueue(jobData: unknown): Promise<void> {
    const { available } = this.pool.getHealthStatus();
    if (available === 0) {
      throw new ServiceUnavailableException('No OCR workers available');
    }
    await this.ocrQueue.add('ocr-job', jobData);
  }
}

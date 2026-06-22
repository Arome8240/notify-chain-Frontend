import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { OcrWorkerPool } from '../ocr/ocr-worker.pool';

@Injectable()
export class OcrHealthIndicator extends HealthIndicator {
  constructor(private readonly pool: OcrWorkerPool) {
    super();
  }

  check(key: string): HealthIndicatorResult {
    const { available, total, failed } = this.pool.getHealthStatus();
    const isUp = available > 0;
    const result = this.getStatus(key, isUp, { workers: available, total, failed });

    if (!isUp) {
      throw new HealthCheckError('OCR workers unavailable', result);
    }
    return result;
  }
}

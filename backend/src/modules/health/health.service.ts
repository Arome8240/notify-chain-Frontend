import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { OcrHealthIndicator } from './ocr-health.indicator';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly ocrIndicator: OcrHealthIndicator,
  ) {}

  @HealthCheck()
  check() {
    return this.health.check([
      () => this.ocrIndicator.check('ocr'),
    ]);
  }
}

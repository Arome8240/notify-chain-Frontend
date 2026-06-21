import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';
import { OcrWorkerPool } from '../src/ocr/ocr-worker.pool';

describe('Health (integration)', () => {
  let app: INestApplication;
  let pool: OcrWorkerPool;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    pool = module.get(OcrWorkerPool);
  });

  afterAll(() => app.close());

  it('GET /api/v1/health includes ocr status when workers available', async () => {
    jest.spyOn(pool, 'getHealthStatus').mockReturnValue({ total: 4, available: 4, failed: 0 });

    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.details.ocr.status).toBe('up');
    expect(res.body.details.ocr.workers).toBe(4);
  });

  it('GET /api/v1/health returns ocr down when no workers', async () => {
    jest.spyOn(pool, 'getHealthStatus').mockReturnValue({ total: 4, available: 0, failed: 4 });

    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(503);
    expect(res.body.details.ocr.status).toBe('down');
  });
});

describe('OCR queue (integration)', () => {
  it('returns 503 when MAX_WORKERS=0', async () => {
    process.env.MAX_WORKERS = '0';

    const { Test } = require('@nestjs/testing');
    const { OcrModule } = require('../src/ocr/ocr.module');
    const module = await Test.createTestingModule({ imports: [OcrModule] }).compile();
    const app = module.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/api/v1/ocr')
      .attach('file', Buffer.from('fake'), 'test.png');

    expect(res.status).toBe(503);
    await app.close();
  });
});

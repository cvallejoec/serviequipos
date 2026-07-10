import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CLOCK, Clock } from '../common/domain';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async check() {
    const db = await this.checkDatabase();

    return {
      status: db.status === 'up' ? 'ok' : 'degraded',
      timestamp: this.clock.now().toISOString(),
      services: { db },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    message?: string;
  }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

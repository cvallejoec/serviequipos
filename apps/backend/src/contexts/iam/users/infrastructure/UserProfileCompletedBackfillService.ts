import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Marca como completado el perfil de los usuarios que ya tienen teléfono
 * cargado. Solo se ejecuta al arranque y solo afecta filas donde
 * profile_completed = false y phone IS NOT NULL.
 */
@Injectable()
export class UserProfileCompletedBackfillService implements OnApplicationBootstrap {
  private readonly logger = new Logger(
    UserProfileCompletedBackfillService.name,
  );

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const result = await this.dataSource.query<{ rowCount?: number }>(
        `UPDATE users
         SET profile_completed = true
         WHERE profile_completed = false AND phone IS NOT NULL`,
      );

      const affected = Array.isArray(result)
        ? ((result as unknown as [unknown[], number])[1] ?? 0)
        : (result?.rowCount ?? 0);

      if (affected > 0) {
        this.logger.log(
          `Backfill profile_completed=true para ${affected} usuario(s) con teléfono`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Falla al hacer backfill de profile_completed',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

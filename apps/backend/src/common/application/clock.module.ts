import { Global, Module } from '@nestjs/common';
import { CLOCK } from '../domain/Clock';
import { SystemClock } from '../domain/SystemClock';

/**
 * Registra el `Clock` del sistema bajo el token `CLOCK`, global para toda la
 * app. Cualquier handler/servicio lo inyecta con `@Inject(CLOCK)`. En tests
 * se sustituye por un `FixedClock`.
 */
@Global()
@Module({
  providers: [{ provide: CLOCK, useClass: SystemClock }],
  exports: [CLOCK],
})
export class ClockModule {}

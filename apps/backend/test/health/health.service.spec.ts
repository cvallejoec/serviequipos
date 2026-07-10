import type { DataSource } from 'typeorm';
import { HealthService } from '../../src/health/health.service';
import { FixedClock, FIXED_NOW } from '../mocks/ClockMock';

/** DataSource falso: solo nos importa el método `query`. */
const dataSourceWith = (query: jest.Mock): DataSource =>
  ({ query }) as unknown as DataSource;

describe('HealthService', () => {
  it('reporta ok/up cuando la base de datos responde', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const service = new HealthService(dataSourceWith(query), new FixedClock());

    const result = await service.check();

    expect(query).toHaveBeenCalledWith('SELECT 1');
    expect(result.status).toBe('ok');
    expect(result.services.db.status).toBe('up');
    expect(result.services.db.message).toBeUndefined();
    // El `timestamp` proviene del reloj fijo, así que es determinista.
    expect(result.timestamp).toBe(FIXED_NOW.toISOString());
  });

  it('reporta degraded/down cuando la consulta falla', async () => {
    const query = jest.fn().mockRejectedValue(new Error('conexión rechazada'));
    const service = new HealthService(dataSourceWith(query), new FixedClock());

    const result = await service.check();

    expect(result.status).toBe('degraded');
    expect(result.services.db.status).toBe('down');
    expect(result.services.db.message).toBe('conexión rechazada');
  });

  it('usa un mensaje por defecto si el error no es una instancia de Error', async () => {
    const query = jest.fn().mockRejectedValue('fallo raro');
    const service = new HealthService(dataSourceWith(query), new FixedClock());

    const result = await service.check();

    expect(result.services.db.status).toBe('down');
    expect(result.services.db.message).toBe('Unknown error');
  });
});

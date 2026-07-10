import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from '../../../src/common/filters/global-exception.filter';
import { DomainError } from '../../../src/common/domain/DomainError';

/** DomainError de prueba para ejercitar la rama de dominio del filtro. */
class TestDomainError extends DomainError {
  readonly type = 'TEST_DOMAIN_ERROR';

  constructor() {
    super('El recurso está en conflicto', HttpStatus.CONFLICT);
  }
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let status: jest.Mock;
  let json: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    // Silenciamos los logs del filtro para no ensuciar la salida del test.
    jest
      .spyOn((filter as unknown as { logger: any }).logger, 'error')
      .mockImplementation(() => undefined);
    jest
      .spyOn((filter as unknown as { logger: any }).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((filter as unknown as { logger: any }).logger, 'log')
      .mockImplementation(() => undefined);

    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });

    const request = { url: '/api/v1/recurso', method: 'GET' };
    const response = { status, json };

    host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  });

  const captureBody = () => json.mock.calls[0][0];

  it('mapea una HttpException de Nest con su status y mensaje', () => {
    filter.catch(new NotFoundException('No existe'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    const body = captureBody();
    expect(body.success).toBe(false);
    expect(body.message).toBe('No existe');
    expect(body.error.code).toBe('HTTP_404');
    expect(body.error.message).toBe('No existe');
    expect(body.error.path).toBe('/api/v1/recurso');
    expect(typeof body.error.errorId).toBe('string');
    expect(typeof body.error.timestamp).toBe('string');
  });

  it('mapea un array de mensajes de HttpException como VALIDATION_ERROR', () => {
    filter.catch(
      new BadRequestException({
        message: ['email inválido', 'nombre requerido'],
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const body = captureBody();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Error de validación');
    expect(body.error.errors).toEqual([
      { message: 'email inválido' },
      { message: 'nombre requerido' },
    ]);
  });

  it('usa el string crudo cuando la respuesta de la HttpException es un string', () => {
    filter.catch(new HttpException('texto plano', HttpStatus.FORBIDDEN), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    const body = captureBody();
    expect(body.message).toBe('texto plano');
    expect(body.error.code).toBe('HTTP_403');
  });

  it('mapea un DomainError usando su suggestedHttpStatus y type', () => {
    filter.catch(new TestDomainError(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const body = captureBody();
    expect(body.success).toBe(false);
    expect(body.message).toBe('El recurso está en conflicto');
    expect(body.error.code).toBe('TEST_DOMAIN_ERROR');
    expect(body.error.message).toBe('El recurso está en conflicto');
    expect(body.error.errors).toBeUndefined();
  });

  it('mapea un Error genérico a 500 con mensaje genérico', () => {
    filter.catch(new Error('boom interno'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const body = captureBody();
    expect(body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.message).toBe(
      'Ha ocurrido un error interno. Por favor, contacta a soporte.',
    );
  });

  it('incluye info de debug fuera de producción', () => {
    filter.catch(new Error('detalle sensible'), host);

    const body = captureBody();
    expect(body.debug).toBeDefined();
    expect(body.debug.description).toBe('detalle sensible');
  });
});

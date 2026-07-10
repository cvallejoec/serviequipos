import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { DomainError } from '../domain/DomainError';

interface ErrorDetail {
  field?: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    message: string;
    errors?: ErrorDetail[];
    errorId: string;
    timestamp: string;
    path: string;
  };
  debug?: {
    description: string;
    stack?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const errorId = randomUUID();
    const timestamp = new Date().toISOString();
    const path = request.url;

    const { status, body } = this.buildResponse(
      exception,
      errorId,
      timestamp,
      path,
    );

    this.logError(exception, status, request, errorId);

    response.status(status).json(body);
  }

  private buildResponse(
    exception: unknown,
    errorId: string,
    timestamp: string,
    path: string,
  ): { status: number; body: ErrorResponse } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, errorId, timestamp, path);
    }

    if (exception instanceof DomainError) {
      return this.handleDomainError(exception, errorId, timestamp, path);
    }

    return this.handleUnknownError(exception, errorId, timestamp, path);
  }

  private handleHttpException(
    exception: HttpException,
    errorId: string,
    timestamp: string,
    path: string,
  ): { status: number; body: ErrorResponse } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Error en la solicitud';
    let errors: ErrorDetail[] | undefined;
    let code = `HTTP_${status}`;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const res = exceptionResponse as Record<string, unknown>;

      if (Array.isArray(res.message)) {
        code = 'VALIDATION_ERROR';
        message = 'Error de validación';
        errors = (res.message as string[]).map((msg) => ({ message: msg }));
      } else if (typeof res.message === 'string') {
        message = res.message;
      }
    }

    const body: ErrorResponse = {
      success: false,
      message,
      error: { code, message, errors, errorId, timestamp, path },
    };

    if (!this.isProduction) {
      body.debug = {
        description: exception.message,
        stack: exception.stack,
      };
    }

    return { status, body };
  }

  private handleDomainError(
    exception: DomainError,
    errorId: string,
    timestamp: string,
    path: string,
  ): { status: number; body: ErrorResponse } {
    const status = exception.suggestedHttpStatus;
    const primitives = exception.toPrimitives();

    const body: ErrorResponse = {
      success: false,
      message: primitives.description,
      error: {
        code: primitives.type,
        message: primitives.description,
        errorId,
        timestamp,
        path,
      },
    };

    if (!this.isProduction) {
      body.debug = { description: exception.message, stack: exception.stack };
    }

    return { status, body };
  }

  private handleUnknownError(
    exception: unknown,
    errorId: string,
    timestamp: string,
    path: string,
  ): { status: number; body: ErrorResponse } {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const unknownMessage =
      'Ha ocurrido un error interno. Por favor, contacta a soporte.';

    const body: ErrorResponse = {
      success: false,
      message: unknownMessage,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: unknownMessage,
        errorId,
        timestamp,
        path,
      },
    };

    if (!this.isProduction) {
      body.debug = {
        description:
          exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      };
    }

    return { status, body };
  }

  private logError(
    exception: unknown,
    status: number,
    request: Request,
    errorId: string,
  ): void {
    const details: string[] = [
      `${request.method} ${request.url} -> ${status}`,
      `errorId=${errorId}`,
    ];

    // Para validation errors (Nest pone los mensajes en `response.message`
    // como array), los aplanamos en una sola línea para que el log sea
    // ejecutable de un vistazo.
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const msg = (res as Record<string, unknown>).message;
        if (Array.isArray(msg)) {
          details.push(`validation=[${msg.join(' | ')}]`);
        } else if (typeof msg === 'string' && msg.length > 0) {
          details.push(`message=${msg}`);
        }
      }
    }

    const baseMessage =
      exception instanceof Error ? exception.message : 'Unknown error';
    const fullMessage = `${baseMessage} (${details.join(' ')})`;

    if (status >= 500) {
      this.logger.error(
        fullMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if ([403, 409, 422].includes(status)) {
      this.logger.warn(fullMessage);
    } else {
      this.logger.log(fullMessage);
    }
  }
}

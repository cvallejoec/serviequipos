import { HttpStatus } from '@nestjs/common';

export abstract class DomainError extends Error {
  abstract readonly type: string;

  readonly suggestedHttpStatus: HttpStatus;

  constructor(
    message: string,
    suggestedHttpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super(message);
    this.suggestedHttpStatus = suggestedHttpStatus;
  }

  toPrimitives(): {
    type: string;
    description: string;
    data: Record<string, unknown>;
  } {
    const props = Object.entries(this).filter(
      ([key]) =>
        !['type', 'message', 'suggestedHttpStatus', 'stack'].includes(key),
    );

    return {
      type: this.type,
      description: this.message,
      data: props.reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: value,
        }),
        {},
      ),
    };
  }
}

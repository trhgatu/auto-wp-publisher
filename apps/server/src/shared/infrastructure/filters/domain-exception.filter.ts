// src/shared/infrastructure/filters/domain-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { IdentityAlreadyExistsException } from '../../../contexts/iam/users/domain/exceptions/identity-already-exists.exception';
import { InvalidCredentialsException } from '../../../contexts/iam/users/domain/exceptions/invalid-credentials.exception';

@Catch(Error)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly exceptionMap = new Map<
    string,
    { status: number; error: string }
  >([
    [
      IdentityAlreadyExistsException.name,
      { status: HttpStatus.CONFLICT, error: 'Conflict' },
    ],
    [
      InvalidCredentialsException.name,
      { status: HttpStatus.UNAUTHORIZED, error: 'Unauthorized' },
    ],
  ]);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the actual error for debugging
    console.error('Unhandled Exception:', exception);

    const exceptionConfig = this.exceptionMap.get(exception.constructor.name);
    if (exceptionConfig) {
      return response.status(exceptionConfig.status).json({
        statusCode: exceptionConfig.status,
        message: exception.message,
        error: exceptionConfig.error,
      });
    }

    // Handle NestJS Built-in HttpExceptions (like NotFoundException)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response
        .status(status)
        .json(
          typeof res === 'object' ? res : { statusCode: status, message: res },
        );
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message:
        exception.message || 'An unexpected error occurred in this reality',
      error: 'Internal Server Error',
    });
  }
}

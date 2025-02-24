import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  LoggerService,
} from '@nestjs/common';
import { Response } from 'express';
import * as requestIp from 'request-ip';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  constructor(private loggerService: LoggerService) {}
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();
    const { headers, query, body, params } = ctx.getRequest();

    const statusCode = exception.getStatus();

    const responseBody = {
      headers,
      query,
      body,
      params,
      timestamp: new Date().toISOString(),
      ip: requestIp.getClientIp(ctx.getRequest()),
      exception: exception.name,
      error: exceptionResponse || 'Internal server error',
    };

    const error =
      typeof response === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;
    this.loggerService.error(error, responseBody);

    if (typeof error === 'string') {
      response.status(statusCode).json({ statusCode, message: error });
    } else {
      response.status(statusCode).json({ statusCode, ...error });
    }
  }
}

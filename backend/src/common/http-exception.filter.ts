import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorLogService } from '../error-log/error-log.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(@Optional() private readonly errorLogService?: ErrorLogService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const stack = exception instanceof Error ? exception.stack : undefined;
    const logMsg = `${req.method} ${req.originalUrl} → ${status}`;

    if (status >= 500) {
      this.logger.error(logMsg, stack);
    } else if (status >= 400) {
      this.logger.warn(logMsg);
    }

    // Only log 500+ errors to DB (skip 4xx client errors)
    if (status >= 500 && this.errorLogService) {
      this.errorLogService.log({
        method: req.method,
        path: req.originalUrl,
        statusCode: status,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        stack,
        ip: req.ip,
      }).catch(() => {});
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      message,
    });
  }
}

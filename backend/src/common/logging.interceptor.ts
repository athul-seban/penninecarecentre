import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] ?? '';
    const start = Date.now();

    const shortAgent = userAgent.length > 60 ? userAgent.slice(0, 60) + '…' : userAgent;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const status = res.statusCode;
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';
        this.logger.log(
          `${method.padEnd(6)} ${originalUrl.padEnd(45)} ${color}${status}${reset}  ${ms}ms  ${ip}`,
        );
      }),
      catchError((err) => {
        const ms = Date.now() - start;
        this.logger.error(
          `${method.padEnd(6)} ${originalUrl.padEnd(45)} \x1b[31mERR\x1b[0m   ${ms}ms  ${err?.status ?? 500} ${err?.message ?? ''}`,
        );
        return throwError(() => err);
      }),
    );
  }
}

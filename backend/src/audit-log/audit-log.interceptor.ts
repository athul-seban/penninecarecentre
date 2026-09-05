import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const SENSITIVE_KEY = /pass|secret|token/i;

/** Redacts credential-shaped values so audit entries never persist plaintext passwords —
 * both direct fields (e.g. { newPassword }) and the settings API's { key, value } update
 * shape (e.g. { key: 'email.smtp.pass', value: '...' }). */
function redact(body: any): any {
  if (Array.isArray(body)) return body.map(redact);
  if (body && typeof body === 'object') {
    if (typeof body.key === 'string' && SENSITIVE_KEY.test(body.key) && 'value' in body) {
      return { ...body, value: '[redacted]' };
    }
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      out[k] = SENSITIVE_KEY.test(k) ? '[redacted]' : redact(v);
    }
    return out;
  }
  return body;
}

/** Records every authenticated create/update/delete request against the CMS so it's
 * clear which admin user made a given change. Unauthenticated mutations (public
 * contact/careers form submissions, login) are skipped since there's no admin to
 * attribute them to. */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLog: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    if (!MUTATING_METHODS.has(req.method)) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const user = req.user;
        if (!user) return;

        let details: string | undefined;
        try {
          details = JSON.stringify(redact(req.body)).slice(0, 2000);
        } catch {
          details = undefined;
        }

        this.auditLog
          .log({
            userId: user.id,
            userEmail: user.email,
            method: req.method,
            path: (req.originalUrl ?? req.url ?? '').split('?')[0],
            details,
            ip: req.ip,
          })
          .catch(() => {});
      }),
    );
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog } from './audit-log.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogInterceptor } from './audit-log.interceptor';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([AuditLog, User, Role])],
  providers: [
    AuditLogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
export class AuditLogModule {}

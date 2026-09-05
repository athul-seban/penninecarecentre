import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { ErrorLog } from './error-log.entity';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { ErrorLogService } from './error-log.service';
import { ErrorLogController } from './error-log.controller';
import { AllExceptionsFilter } from '../common/http-exception.filter';

@Module({
  // User/Role are also imported here so PermissionsGuard (used via @UseGuards on
  // this controller) can resolve its own dependencies within this module's scope.
  imports: [TypeOrmModule.forFeature([ErrorLog, User, Role])],
  providers: [
    ErrorLogService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [ErrorLogController],
  exports: [ErrorLogService],
})
export class ErrorLogModule {}

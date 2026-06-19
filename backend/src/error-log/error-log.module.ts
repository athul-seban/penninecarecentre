import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { ErrorLog } from './error-log.entity';
import { ErrorLogService } from './error-log.service';
import { ErrorLogController } from './error-log.controller';
import { AllExceptionsFilter } from '../common/http-exception.filter';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorLog])],
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

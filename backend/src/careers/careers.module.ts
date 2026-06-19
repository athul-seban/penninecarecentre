import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Job])],
  providers: [CareersService],
  controllers: [CareersController],
})
export class CareersModule {}

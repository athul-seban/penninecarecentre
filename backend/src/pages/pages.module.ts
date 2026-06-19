import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageContent } from './page-content.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageContent])],
  providers: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}

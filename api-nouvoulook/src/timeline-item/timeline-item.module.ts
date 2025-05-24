import { Module } from '@nestjs/common';
import { TimelineItemService } from './timeline-item.service';
import { TimelineItemController } from './timeline-item.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimelineItemController],
  providers: [TimelineItemService],
  exports: [TimelineItemService],
})
export class TimelineItemModule {} 
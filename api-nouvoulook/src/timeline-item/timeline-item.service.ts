import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimelineItemDto } from './dto/create-timeline-item.dto';
import { UpdateTimelineItemDto } from './dto/update-timeline-item.dto';

@Injectable()
export class TimelineItemService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTimelineItemDto) {
    return this.prisma.timelineItem.create({ data: dto });
  }

  findAll() {
    return this.prisma.timelineItem.findMany({
      orderBy: { year: 'asc' }
    });
  }

  findOne(id: string) {
    return this.prisma.timelineItem.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateTimelineItemDto) {
    return this.prisma.timelineItem.update({
      where: { id },
      data: dto
    });
  }

  remove(id: string) {
    return this.prisma.timelineItem.delete({ where: { id } });
  }
} 
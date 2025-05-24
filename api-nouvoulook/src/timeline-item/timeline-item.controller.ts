import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TimelineItemService } from './timeline-item.service';
import { CreateTimelineItemDto } from './dto/create-timeline-item.dto';
import { UpdateTimelineItemDto } from './dto/update-timeline-item.dto';
import { Public } from 'src/decorators/public.decorator';
@Controller('timeline-item')
export class TimelineItemController {
  constructor(private readonly timelineItemService: TimelineItemService) {}

  @Post()
  create(@Body() dto: CreateTimelineItemDto) {
    return this.timelineItemService.create(dto);
  }

  @Get()
  @Public()
  findAll() {
    return this.timelineItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timelineItemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTimelineItemDto) {
    return this.timelineItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timelineItemService.remove(id);
  }
} 
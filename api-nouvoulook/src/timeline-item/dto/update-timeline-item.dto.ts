import { PartialType } from '@nestjs/mapped-types';
import { CreateTimelineItemDto } from './create-timeline-item.dto';

export class UpdateTimelineItemDto extends PartialType(CreateTimelineItemDto) {} 
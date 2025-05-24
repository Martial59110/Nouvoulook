import { IsString } from 'class-validator';

export class CreateTimelineItemDto {
  @IsString()
  year: string;

  @IsString()
  description: string;
} 
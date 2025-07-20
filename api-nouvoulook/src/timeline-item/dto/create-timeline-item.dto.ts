import { IsString, IsOptional } from 'class-validator';

export class CreateTimelineItemDto {
  @IsString()
  year: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;
} 
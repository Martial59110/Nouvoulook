import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateHistorySectionDto {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  textContent?: string;
} 
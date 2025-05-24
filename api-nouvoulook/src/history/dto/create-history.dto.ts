import { IsString } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  imageUrl: string;

  @IsString()
  textContent: string;

  @IsString()
  textContent2: string;

  @IsString()
  textContent3: string;
} 
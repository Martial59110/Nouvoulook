import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  textContent: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;
} 
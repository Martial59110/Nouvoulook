import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTextVolunteerDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsString()
  textContent: string;

  @IsString()
  @IsOptional()
  flyerPdfUrl?: string;
} 
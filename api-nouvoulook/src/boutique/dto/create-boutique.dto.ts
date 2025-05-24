import { IsString, IsOptional } from 'class-validator';

export class CreateBoutiqueDto {
  @IsString()
  imageUrl: string;

  @IsString()
  @IsOptional()
  image1?: string;

  @IsString()
  @IsOptional()
  image2?: string;

  @IsString()
  @IsOptional()
  image3?: string;

  @IsString()
  @IsOptional()
  flyerPdfUrl?: string;
} 
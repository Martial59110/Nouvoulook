import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateClothingExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  accepted?: boolean;
} 
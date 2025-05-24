import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTextDonationDto {
  @IsString()
  @IsNotEmpty()
  messageSchedule: string;

  @IsString()
  @IsNotEmpty()
  messageAdvertising: string;

  @IsString()
  imageUrl?: string;

  @IsString()
  flyerPdfUrl?: string;
} 
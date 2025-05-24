import { PartialType } from '@nestjs/mapped-types';
import { CreateTextDonationDto } from './create-text-donation.dto';

export class UpdateTextDonationDto extends PartialType(CreateTextDonationDto) {} 
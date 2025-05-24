import { PartialType } from '@nestjs/mapped-types';
import { CreateTextVolunteerDto } from './create-text-volunteer.dto';

export class UpdateTextVolunteerDto extends PartialType(CreateTextVolunteerDto) {} 
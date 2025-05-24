import { PartialType } from '@nestjs/mapped-types';
import { CreateClothingExampleDto } from './create-clothing-example.dto';

export class UpdateClothingExampleDto extends PartialType(CreateClothingExampleDto) {} 
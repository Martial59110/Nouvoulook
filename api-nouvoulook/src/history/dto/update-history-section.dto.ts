import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorySectionDto } from './create-history-section.dto';
 
export class UpdateHistorySectionDto extends PartialType(CreateHistorySectionDto) {} 
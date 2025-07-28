import { Module } from '@nestjs/common';
import { LegalMentionsService } from './legal-mentions.service';
import { LegalMentionsController } from './legal-mentions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LegalMentionsService],
  controllers: [LegalMentionsController],
  exports: [LegalMentionsService],
})
export class LegalMentionsModule {} 
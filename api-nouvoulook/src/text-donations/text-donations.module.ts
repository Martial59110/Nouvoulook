import { Module } from '@nestjs/common';
import { TextDonationsService } from './text-donations.service';
import { TextDonationsController } from './text-donations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TextDonationsController],
  providers: [TextDonationsService],
  exports: [TextDonationsService],
})
export class TextDonationsModule {} 
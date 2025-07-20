import { Module } from '@nestjs/common';
import { PdfDocumentsService } from './pdf-documents.service';
import { PdfDocumentsController } from './pdf-documents.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PdfDocumentsController],
  providers: [PdfDocumentsService],
  exports: [PdfDocumentsService],
})
export class PdfDocumentsModule {} 
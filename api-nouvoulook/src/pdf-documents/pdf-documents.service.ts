import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PdfDocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pdfDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: { name: string; url: string }) {
    return this.prisma.pdfDocument.create({
      data
    });
  }

  async delete(id: number) {
    return this.prisma.pdfDocument.delete({
      where: { id }
    });
  }
} 
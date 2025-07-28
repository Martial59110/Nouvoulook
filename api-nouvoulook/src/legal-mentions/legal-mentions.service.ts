import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalMentionsService {
  constructor(private prisma: PrismaService) {}

  async getLegalMentions() {
    return this.prisma.legalMentions.findFirst();
  }

  async updateLegalMentions(dto: any) {
    const legalMentions = await this.prisma.legalMentions.findFirst();
    if (!legalMentions) {
      return this.prisma.legalMentions.create({
        data: dto,
      });
    }
    return this.prisma.legalMentions.update({
      where: { id: legalMentions.id },
      data: dto,
    });
  }
} 
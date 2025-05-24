import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async getContactInfo() {
    return this.prisma.contactInfo.findFirst();
  }

  async updateContactInfo(dto: any) {
    const contact = await this.prisma.contactInfo.findFirst();
    if (!contact) throw new Error('Aucune info de contact trouvée');
    return this.prisma.contactInfo.update({
      where: { id: contact.id },
      data: dto,
    });
  }
} 
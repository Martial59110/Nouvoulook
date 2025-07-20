import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { UpdateBoutiqueDto } from './dto/update-boutique.dto';

@Injectable()
export class BoutiqueService {
  constructor(private prisma: PrismaService) {}

  async create(createBoutiqueDto: CreateBoutiqueDto) {
    return this.prisma.boutique.create({
      data: createBoutiqueDto,
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.boutique.findMany({
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.boutique.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async update(id: string, updateBoutiqueDto: UpdateBoutiqueDto) {
    return this.prisma.boutique.update({
      where: { id },
      data: updateBoutiqueDto,
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async remove(id: string) {
    return this.prisma.boutique.delete({
      where: { id }
    });
  }

  // Méthodes pour gérer les sections
  async createSection(boutiqueId: string, sectionData: any) {
    return this.prisma.boutiqueSection.create({
      data: {
        ...sectionData,
        boutiqueId
      }
    });
  }

  async updateSection(sectionId: string, sectionData: any) {
    return this.prisma.boutiqueSection.update({
      where: { id: sectionId },
      data: sectionData
    });
  }

  async deleteSection(sectionId: string) {
    return this.prisma.boutiqueSection.delete({
      where: { id: sectionId }
    });
  }

  async reorderSections(sections: { id: string; order: number }[]) {
    const updates = sections.map(section => 
      this.prisma.boutiqueSection.update({
        where: { id: section.id },
        data: { order: section.order }
      })
    );
    
    return this.prisma.$transaction(updates);
  }
} 
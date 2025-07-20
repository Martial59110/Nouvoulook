import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { CreateHistorySectionDto } from './dto/create-history-section.dto';
import { UpdateHistorySectionDto } from './dto/update-history-section.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHistoryDto) {
    return this.prisma.history.create({ data: dto });
  }

  findAll() {
    return this.prisma.history.findMany({
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  findOne(id: string) {
    return this.prisma.history.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  update(id: string, dto: UpdateHistoryDto) {
    return this.prisma.history.update({
      where: { id },
      data: dto
    });
  }

  remove(id: string) {
    return this.prisma.history.delete({ where: { id } });
  }

  // Méthodes pour les sections d'histoire
  createSection(historyId: string, dto: CreateHistorySectionDto) {
    return this.prisma.historySection.create({
      data: {
        ...dto,
        historyId
      }
    });
  }

  updateSection(id: string, dto: UpdateHistorySectionDto) {
    return this.prisma.historySection.update({
      where: { id },
      data: dto
    });
  }

  removeSection(id: string) {
    return this.prisma.historySection.delete({
      where: { id }
    });
  }

  reorderSections(historyId: string, sectionIds: string[]) {
    // Mettre à jour l'ordre de toutes les sections
    const updates = sectionIds.map((sectionId, index) => 
      this.prisma.historySection.update({
        where: { id: sectionId },
        data: { order: index + 1 }
      })
    );
    
    return this.prisma.$transaction(updates);
  }
} 
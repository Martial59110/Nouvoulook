import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateHistoryDto) {
    return this.prisma.history.create({ data: dto });
  }

  findAll() {
    return this.prisma.history.findMany();
  }

  findOne(id: string) {
    return this.prisma.history.findUnique({
      where: { id }
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
} 
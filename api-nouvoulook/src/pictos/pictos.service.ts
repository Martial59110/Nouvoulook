import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class PictosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.picto.findMany();
  }

  async create(url: string) {
    return this.prisma.picto.create({ data: { url } });
  }

  async remove(id: number) {
    const picto = await this.prisma.picto.findUnique({ where: { id } });
    if (!picto) {
      throw new HttpException('Picto non trouvé', HttpStatus.NOT_FOUND);
    }
    const filePath = `./public${picto.url}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await this.prisma.picto.delete({ where: { id } });
    return { message: 'Picto supprimé' };
  }
} 
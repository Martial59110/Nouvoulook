import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { UpdateBoutiqueDto } from './dto/update-boutique.dto';
import { Boutique } from './entities/boutique.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class BoutiqueService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('BoutiqueService');
  }

  async create(dto: CreateBoutiqueDto): Promise<Boutique> {
    this.logger.info('Creating new boutique', { ...dto });
    const boutique = await this.prisma.boutique.create({
      data: {
        ...dto,
        flyerPdfUrl: dto.flyerPdfUrl,
      },
    });
    this.logger.info('Boutique created successfully', { id: boutique.id });
    return boutique;
  }

  async findAll(): Promise<Boutique[]> {
    this.logger.info('Fetching all boutiques');
    const boutiques = await this.prisma.boutique.findMany();
    this.logger.info(`Found ${boutiques.length} boutiques`);
    return boutiques;
  }

  async findOne(id: string): Promise<Boutique> {
    this.logger.info('Fetching boutique by id', { id });
    const boutique = await this.prisma.boutique.findUnique({
      where: { id },
    });
    if (!boutique) {
      this.logger.warn('Boutique not found', { id });
      throw new NotFoundException(`Boutique with ID ${id} not found`);
    }
    this.logger.info('Boutique found successfully', { id });
    return boutique;
  }

  async update(id: string, dto: UpdateBoutiqueDto): Promise<Boutique> {
    this.logger.info('Updating boutique', { id, ...dto });
    await this.findOne(id);
    const updated = await this.prisma.boutique.update({
      where: { id },
      data: {
        ...dto,
        flyerPdfUrl: dto.flyerPdfUrl,
      },
    });
    this.logger.info('Boutique updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<Boutique> {
    this.logger.info('Removing boutique', { id });
    await this.findOne(id);
    const deleted = await this.prisma.boutique.delete({
      where: { id },
    });
    this.logger.info('Boutique deleted successfully', { id });
    return deleted;
  }
} 
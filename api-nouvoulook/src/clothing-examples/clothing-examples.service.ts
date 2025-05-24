import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClothingExampleDto } from './dto/create-clothing-example.dto';
import { UpdateClothingExampleDto } from './dto/update-clothing-example.dto';
import { ClothingExample } from './entities/clothing-example.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ClothingExamplesService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('ClothingExamplesService');
  }

  async create(createClothingExampleDto: CreateClothingExampleDto, userId: string): Promise<ClothingExample> {
    this.logger.info('Creating new clothing example', { userId, ...createClothingExampleDto });
    const example = await this.prisma.clothingExample.create({
      data: {
        ...createClothingExampleDto,
        userId,
      },
      include: {
        user: true,
      },
    });
    this.logger.info('Clothing example created successfully', { id: example.id });
    return example;
  }

  async findAll(): Promise<ClothingExample[]> {
    this.logger.info('Fetching all clothing examples');
    const examples = await this.prisma.clothingExample.findMany({
      include: {
        user: true,
      },
    });
    this.logger.info(`Found ${examples.length} clothing examples`);
    return examples;
  }

  async findOne(id: string): Promise<ClothingExample> {
    this.logger.info('Fetching clothing example by id', { id });
    const example = await this.prisma.clothingExample.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!example) {
      this.logger.warn('Clothing example not found', { id });
      throw new NotFoundException(`Clothing example with ID ${id} not found`);
    }

    this.logger.info('Clothing example found successfully', { id });
    return example;
  }

  async update(id: string, updateClothingExampleDto: UpdateClothingExampleDto): Promise<ClothingExample> {
    this.logger.info('Updating clothing example', { id, ...updateClothingExampleDto });
    await this.findOne(id);
    
    const updated = await this.prisma.clothingExample.update({
      where: { id },
      data: updateClothingExampleDto,
      include: {
        user: true,
      },
    });
    this.logger.info('Clothing example updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<ClothingExample> {
    this.logger.info('Removing clothing example', { id });
    await this.findOne(id);
    
    const deleted = await this.prisma.clothingExample.delete({
      where: { id },
      include: {
        user: true,
      },
    });
    this.logger.info('Clothing example deleted successfully', { id });
    return deleted;
  }

  async findMany(where: any): Promise<ClothingExample[]> {
    this.logger.info('Fetching filtered clothing examples', { where });
    return this.prisma.clothingExample.findMany({
      where,
      include: { user: true },
    });
  }
} 
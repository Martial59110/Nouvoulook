import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { Partner } from './entities/partner.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PartnersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('PartnersService');
  }

  async create(createPartnerDto: CreatePartnerDto, userId: string): Promise<Partner> {
    this.logger.info('Creating new partner', { userId, ...createPartnerDto });
    const partner = await this.prisma.partner.create({
      data: {
        ...createPartnerDto,
        userId,
      },
      include: {
        user: true,
      },
    });
    this.logger.info('Partner created successfully', { id: partner.id });
    return partner;
  }

  async findAll(): Promise<Partner[]> {
    this.logger.info('Fetching all partners');
    const partners = await this.prisma.partner.findMany({
      include: {
        user: true,
      },
    });
    this.logger.info(`Found ${partners.length} partners`);
    return partners;
  }

  async findOne(id: string): Promise<Partner> {
    this.logger.info('Fetching partner by id', { id });
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!partner) {
      this.logger.warn('Partner not found', { id });
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    this.logger.info('Partner found successfully', { id });
    return partner;
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto): Promise<Partner> {
    this.logger.info('Updating partner', { id, ...updatePartnerDto });
    await this.findOne(id);
    
    const updated = await this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
      include: {
        user: true,
      },
    });
    this.logger.info('Partner updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<Partner> {
    this.logger.info('Removing partner', { id });
    await this.findOne(id);
    
    const deleted = await this.prisma.partner.delete({
      where: { id },
      include: {
        user: true,
      },
    });
    this.logger.info('Partner deleted successfully', { id });
    return deleted;
  }
} 
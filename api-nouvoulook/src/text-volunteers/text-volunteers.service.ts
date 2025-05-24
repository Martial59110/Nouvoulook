import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTextVolunteerDto } from './dto/create-text-volunteer.dto';
import { UpdateTextVolunteerDto } from './dto/update-text-volunteer.dto';
import { TextVolunteer } from './entities/text-volunteer.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TextVolunteersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('TextVolunteersService');
  }

  async create(createTextVolunteerDto: CreateTextVolunteerDto, userId: string): Promise<TextVolunteer> {
    this.logger.info('Creating new text volunteer', { userId, ...createTextVolunteerDto });
    
    // Check if user already has a text volunteer profile
    const existingVolunteer = await this.prisma.textVolunteer.findUnique({
      where: { userId },
    });

    if (existingVolunteer) {
      this.logger.warn('User already has a text volunteer profile', { userId });
      throw new Error('User already has a text volunteer profile');
    }

    const volunteer = await this.prisma.textVolunteer.create({
      data: {
        ...createTextVolunteerDto,
        flyerPdfUrl: createTextVolunteerDto.flyerPdfUrl,
        userId,
      },
      include: {
        user: true,
      },
    });

    this.logger.info('Text volunteer created successfully', { id: volunteer.id });
    return volunteer;
  }

  async findAll(): Promise<TextVolunteer[]> {
    this.logger.info('Fetching all text volunteers');
    const volunteers = await this.prisma.textVolunteer.findMany({
      include: {
        user: true,
      },
    });
    this.logger.info(`Found ${volunteers.length} text volunteers`);
    return volunteers;
  }

  async findOne(id: string): Promise<TextVolunteer> {
    this.logger.info('Fetching text volunteer by id', { id });
    const volunteer = await this.prisma.textVolunteer.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!volunteer) {
      this.logger.warn('Text volunteer not found', { id });
      throw new NotFoundException(`Text volunteer with ID ${id} not found`);
    }

    this.logger.info('Text volunteer found successfully', { id });
    return volunteer;
  }

  async update(id: string, updateTextVolunteerDto: UpdateTextVolunteerDto): Promise<TextVolunteer> {
    this.logger.info('Updating text volunteer', { id, ...updateTextVolunteerDto });
    await this.findOne(id);

    const updated = await this.prisma.textVolunteer.update({
      where: { id },
      data: {
        ...updateTextVolunteerDto,
        flyerPdfUrl: updateTextVolunteerDto.flyerPdfUrl,
      },
      include: {
        user: true,
      },
    });

    this.logger.info('Text volunteer updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<TextVolunteer> {
    this.logger.info('Removing text volunteer', { id });
    await this.findOne(id);

    const deleted = await this.prisma.textVolunteer.delete({
      where: { id },
      include: {
        user: true,
      },
    });

    this.logger.info('Text volunteer deleted successfully', { id });
    return deleted;
  }
} 
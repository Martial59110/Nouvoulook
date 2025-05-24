import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('NewsService');
  }

  async create(createNewsDto: CreateNewsDto, userId: string): Promise<News> {
    this.logger.info('Creating new news', { userId, ...createNewsDto });
    const news = await this.prisma.news.create({
      data: {
        ...createNewsDto,
        userId,
      },
      include: {
        user: true,
      },
    });
    this.logger.info('News created successfully', { id: news.id });
    return news;
  }

  async findAll(): Promise<News[]> {
    this.logger.info('Fetching all news');
    const news = await this.prisma.news.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    this.logger.info(`Found ${news.length} news`);
    return news;
  }

  async findOne(id: string): Promise<News> {
    this.logger.info('Fetching news by id', { id });
    const news = await this.prisma.news.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!news) {
      this.logger.warn('News not found', { id });
      throw new NotFoundException(`News with ID ${id} not found`);
    }

    this.logger.info('News found successfully', { id });
    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<News> {
    this.logger.info('Updating news', { id, ...updateNewsDto });
    await this.findOne(id);
    
    const updated = await this.prisma.news.update({
      where: { id },
      data: updateNewsDto,
      include: {
        user: true,
      },
    });
    this.logger.info('News updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<News> {
    this.logger.info('Removing news', { id });
    await this.findOne(id);
    
    const deleted = await this.prisma.news.delete({
      where: { id },
      include: {
        user: true,
      },
    });
    this.logger.info('News deleted successfully', { id });
    return deleted;
  }
} 
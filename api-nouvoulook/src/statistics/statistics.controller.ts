import { Controller, Get, Post, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { Request } from 'express';
import { Public } from '../auth/public.decorator';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Public()
  @Post('pageview')
  async recordPageView(@Req() req: Request) {
    const path = req.path;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.statisticsService.recordPageView(path, ipAddress, userAgent);
  }

  @Get('total')
  async getTotalViews() {
    return this.statisticsService.getTotalViews();
  }

  @Get('daily')
  async getDailyViews() {
    return this.statisticsService.getDailyViews();
  }

  @Get('weekly')
  async getWeeklyViews() {
    return this.statisticsService.getWeeklyViews();
  }

  @Get('monthly')
  async getMonthlyViews() {
    return this.statisticsService.getMonthlyViews();
  }

  @Get('yearly')
  async getYearlyViews() {
    return this.statisticsService.getYearlyViews();
  }
} 
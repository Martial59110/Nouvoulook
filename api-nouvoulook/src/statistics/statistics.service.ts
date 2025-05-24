import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '../prisma/generated';

@Injectable()
export class StatisticsService {
  private prisma: PrismaClient;

  constructor(private prismaService: PrismaService) {
    this.prisma = prismaService as unknown as PrismaClient;
  }

  async recordPageView(path: string, ipAddress?: string, userAgent?: string) {
    // Vérifier si une visite existe déjà aujourd'hui pour cette IP et ce user-agent
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Utiliser une requête count au lieu de findFirst pour plus d'efficacité
    const visitCount = await this.prisma.pageView.count({
      where: {
        ipAddress,
        userAgent,
        createdAt: {
          gte: today,
        },
      },
    });

    if (visitCount > 0) {
      return { message: 'Visite déjà enregistrée aujourd\'hui' };
    }

    // Si aucune visite n'existe, en créer une nouvelle
    return this.prisma.pageView.create({
      data: {
        path,
        ipAddress,
        userAgent,
      },
    });
  }

  async getTotalViews() {
    return this.prisma.pageView.count();
  }

  async getDailyViews() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.pageView.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  async getWeeklyViews() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.prisma.pageView.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });
  }

  async getMonthlyViews() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.prisma.pageView.count({
      where: {
        createdAt: {
          gte: monthAgo,
        },
      },
    });
  }

  async getYearlyViews() {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    return this.prisma.pageView.count({
      where: {
        createdAt: {
          gte: yearAgo,
        },
      },
    });
  }
} 
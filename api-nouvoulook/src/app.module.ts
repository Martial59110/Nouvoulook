import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { PartnersModule } from './partners/partners.module';
import { NewsModule } from './news/news.module';
import { TextDonationsModule } from './text-donations/text-donations.module';
import { TextVolunteersModule } from './text-volunteers/text-volunteers.module';
import { ClothingExamplesModule } from './clothing-examples/clothing-examples.module';
import { StatisticsModule } from './statistics/statistics.module';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PermissionsModule } from './permissions/permissions.module';
import { PictosModule } from './pictos/pictos.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { HistoryModule } from './history/history.module';
import { TimelineItemModule } from './timeline-item/timeline-item.module';
import { BoutiqueModule } from './boutique/boutique.module';
import { PdfDocumentsModule } from './pdf-documents/pdf-documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    PartnersModule,
    NewsModule,
    TextDonationsModule,
    TextVolunteersModule,
    ClothingExamplesModule,
    StatisticsModule,
    PermissionsModule,
    PictosModule,
    ContactInfoModule,
    HistoryModule,
    TimelineItemModule,
    BoutiqueModule,
    PdfDocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
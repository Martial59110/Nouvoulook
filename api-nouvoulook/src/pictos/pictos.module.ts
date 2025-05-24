import { Module } from '@nestjs/common';
import { PictosController } from './pictos.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PictosService } from './pictos.service';

@Module({
  controllers: [PictosController],
  providers: [PictosService, PrismaService],
})
export class PictosModule {} 
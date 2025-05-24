import { Module } from '@nestjs/common';
import { ClothingExamplesService } from './clothing-examples.service';
import { ClothingExamplesController } from './clothing-examples.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClothingExamplesController],
  providers: [ClothingExamplesService],
  exports: [ClothingExamplesService],
})
export class ClothingExamplesModule {} 
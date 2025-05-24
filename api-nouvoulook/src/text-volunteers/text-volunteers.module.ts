import { Module } from '@nestjs/common';
import { TextVolunteersService } from './text-volunteers.service';
import { TextVolunteersController } from './text-volunteers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TextVolunteersController],
  providers: [TextVolunteersService],
  exports: [TextVolunteersService],
})
export class TextVolunteersModule {} 
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { CreateHistorySectionDto } from './dto/create-history-section.dto';
import { UpdateHistorySectionDto } from './dto/update-history-section.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(@Body() dto: CreateHistoryDto) {
    return this.historyService.create(dto);
  }

  @Get()
  @Public()
  findAll() {
    return this.historyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHistoryDto) {
    return this.historyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }

  // Endpoints pour les sections
  @Post(':id/sections')
  createSection(@Param('id') historyId: string, @Body() dto: CreateHistorySectionDto) {
    return this.historyService.createSection(historyId, dto);
  }

  @Patch('sections/:id')
  updateSection(@Param('id') id: string, @Body() dto: UpdateHistorySectionDto) {
    return this.historyService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  removeSection(@Param('id') id: string) {
    return this.historyService.removeSection(id);
  }

  @Post(':id/sections/reorder')
  reorderSections(@Param('id') historyId: string, @Body() body: { sectionIds: string[] }) {
    return this.historyService.reorderSections(historyId, body.sectionIds);
  }
} 
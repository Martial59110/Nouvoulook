import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ClothingExamplesService } from './clothing-examples.service';
import { CreateClothingExampleDto } from './dto/create-clothing-example.dto';
import { UpdateClothingExampleDto } from './dto/update-clothing-example.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Public } from 'src/decorators/public.decorator';
@Controller('clothing-examples')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClothingExamplesController {
  constructor(private readonly clothingExamplesService: ClothingExamplesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  create(@Body() createClothingExampleDto: CreateClothingExampleDto, @Req() req) {
    return this.clothingExamplesService.create(createClothingExampleDto, req.user.id);
  }

  @Get()
  @Public()
  findAll(@Query('accepted') accepted?: string) {
    if (accepted === 'true') {
      return this.clothingExamplesService.findMany({ accepted: true });
    }
    if (accepted === 'false') {
      return this.clothingExamplesService.findMany({ accepted: false });
    }
    return this.clothingExamplesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clothingExamplesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateClothingExampleDto: UpdateClothingExampleDto) {
    return this.clothingExamplesService.update(id, updateClothingExampleDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.clothingExamplesService.remove(id);
  }
} 
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BoutiqueService } from './boutique.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { UpdateBoutiqueDto } from './dto/update-boutique.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('boutique')
export class BoutiqueController {
  constructor(private readonly boutiqueService: BoutiqueService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createBoutiqueDto: CreateBoutiqueDto) {
    return this.boutiqueService.create(createBoutiqueDto);
  }

  @Get()
  @Public()
  findAll() {
    return this.boutiqueService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.boutiqueService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateBoutiqueDto: UpdateBoutiqueDto) {
    return this.boutiqueService.update(id, updateBoutiqueDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.boutiqueService.remove(id);
  }

  // Endpoints pour gérer les sections
  @Post(':boutiqueId/sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSection(@Param('boutiqueId') boutiqueId: string, @Body() sectionData: any) {
    return this.boutiqueService.createSection(boutiqueId, sectionData);
  }

  @Patch('sections/:sectionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateSection(@Param('sectionId') sectionId: string, @Body() sectionData: any) {
    return this.boutiqueService.updateSection(sectionId, sectionData);
  }

  @Delete('sections/:sectionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteSection(@Param('sectionId') sectionId: string) {
    return this.boutiqueService.deleteSection(sectionId);
  }

  @Post('sections/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  reorderSections(@Body() sections: { id: string; order: number }[]) {
    return this.boutiqueService.reorderSections(sections);
  }

  // Upload de flyer PDF
  @Post('upload-flyer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/assets',
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          return cb(null, `flyer-${timestamp}.pdf`);
        },
      }),
    }),
  )
  uploadFlyer(@UploadedFile() file: any) {
    try {
      if (!file) {
        throw new Error('Aucun fichier n\'a été uploadé');
      }
      return { url: `/assets/${file.filename}` };
    } catch (error) {
      console.error('Erreur upload flyer:', error);
      throw error;
    }
  }

  @Delete('delete-flyer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteFlyer(@Body() body: { url: string }) {
    // Ici tu peux ajouter la logique pour supprimer le fichier
    return { success: true };
  }
} 
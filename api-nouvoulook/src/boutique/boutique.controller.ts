import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { BoutiqueService } from './boutique.service';
import { CreateBoutiqueDto } from './dto/create-boutique.dto';
import { UpdateBoutiqueDto } from './dto/update-boutique.dto';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('boutique')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoutiqueController {
  constructor(private readonly boutiqueService: BoutiqueService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  create(@Body() dto: CreateBoutiqueDto) {
    return this.boutiqueService.create(dto);
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
  @Roles(Role.ADMIN, Role.USER)
  update(@Param('id') id: string, @Body() dto: UpdateBoutiqueDto) {
    return this.boutiqueService.update(id, dto);
  }

  @Delete('delete-flyer')
  async deleteFlyer(@Body('url') url: string) {
    if (!url) return { error: 'Aucune URL fournie' };
    const filePath = `./public${url}`;
    console.log('Tentative de suppression du fichier:', filePath);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return { success: true };
      }
      console.log('Fichier non trouvé à:', filePath);
      return { error: 'Fichier non trouvé' };
    } catch (e) {
      console.error('Erreur lors de la suppression:', e);
      return { error: 'Erreur lors de la suppression du fichier' };
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.USER)
  remove(@Param('id') id: string) {
    return this.boutiqueService.remove(id);
  }

  @Post('upload-flyer')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/assets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + extname(file.originalname);
        cb(null, 'boutique-flyer-' + uniqueSuffix);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Seuls les fichiers PDF sont autorisés !'), false);
      }
    }
  }))
  async uploadFlyer(@UploadedFile() file: any) {
    if (!file) {
      return { error: 'Aucun fichier reçu' };
    }
    return { url: `/assets/${file.filename}` };
  }
} 
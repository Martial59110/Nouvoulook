import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TextDonationsService } from './text-donations.service';
import { CreateTextDonationDto } from './dto/create-text-donation.dto';
import { UpdateTextDonationDto } from './dto/update-text-donation.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import * as fs from 'fs';

@Controller('text-donations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TextDonationsController {
  constructor(private readonly textDonationsService: TextDonationsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  create(@Body() createTextDonationDto: CreateTextDonationDto, @Req() req) {
    return this.textDonationsService.create(createTextDonationDto, req.user.id);
  }

  @Get()
  @Public()
  findAll() {
    return this.textDonationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.textDonationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateTextDonationDto: UpdateTextDonationDto) {
    return this.textDonationsService.update(id, updateTextDonationDto);
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
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    console.log('APPEL DE LA ROUTE DELETE /text-donations/:id', id);
    return this.textDonationsService.remove(id);
  }

  @Post('upload-flyer')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/assets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + extname(file.originalname);
        cb(null, 'flyer-' + uniqueSuffix);
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

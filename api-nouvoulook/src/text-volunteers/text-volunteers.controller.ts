import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TextVolunteersService } from './text-volunteers.service';
import { CreateTextVolunteerDto } from './dto/create-text-volunteer.dto';
import { UpdateTextVolunteerDto } from './dto/update-text-volunteer.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TextVolunteer } from './entities/text-volunteer.entity';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from 'src/auth/public.decorator';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('text-volunteers')
@UseGuards(JwtAuthGuard)
export class TextVolunteersController {
  constructor(private readonly textVolunteersService: TextVolunteersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.USER)
  create(
    @Body() createTextVolunteerDto: CreateTextVolunteerDto,
    @Request() req,
  ): Promise<TextVolunteer> {
    return this.textVolunteersService.create(createTextVolunteerDto, req.user.id);
  }

  @Get()
  @Public()
  findAll(): Promise<TextVolunteer[]> {
    return this.textVolunteersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TextVolunteer> {
    return this.textVolunteersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTextVolunteerDto: UpdateTextVolunteerDto,
  ): Promise<TextVolunteer> {
    return this.textVolunteersService.update(id, updateTextVolunteerDto);
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
  remove(@Param('id') id: string): Promise<TextVolunteer> {
    return this.textVolunteersService.remove(id);
  }

  @Post('upload-flyer')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/assets',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + extname(file.originalname);
        cb(null, 'volunteer-flyer-' + uniqueSuffix);
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
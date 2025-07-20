import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfDocumentsService } from './pdf-documents.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { Public } from '../decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('pdf-documents')
export class PdfDocumentsController {
  constructor(private readonly pdfDocumentsService: PdfDocumentsService) {}

  @Get()
  @Public()
  findAll() {
    return this.pdfDocumentsService.findAll();
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/assets',
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          return cb(null, `pdf-${timestamp}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadPdf(@UploadedFile() file: any, @Body() body: { name: string }) {
    if (!file) {
      throw new Error('Aucun fichier n\'a été uploadé');
    }
    
    return this.pdfDocumentsService.create({
      name: body.name || file.originalname,
      url: `/assets/${file.filename}`
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id') id: string) {
    return this.pdfDocumentsService.delete(parseInt(id));
  }
} 
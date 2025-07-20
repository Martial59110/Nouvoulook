import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, Res, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PictosService } from './pictos.service';
import { Response } from 'express';
import { existsSync, mkdirSync } from 'fs';
import { Public } from '../decorators/public.decorator';

@Controller('pictos')
export class PictosController {
  constructor(private readonly pictosService: PictosService) {}

  @Get()
  @Public()
  async findAll() {
    return this.pictosService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/assets/pictos';
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async uploadPicto(@UploadedFile() file: any, @Res() res: Response) {
    if (!file) {
      throw new HttpException('Aucun fichier envoyé', HttpStatus.BAD_REQUEST);
    }
    
    const url = `/assets/pictos/${file.filename}`;
    const picto = await this.pictosService.create(url);
    return res.status(201).json(picto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.pictosService.remove(Number(id));
  }
} 
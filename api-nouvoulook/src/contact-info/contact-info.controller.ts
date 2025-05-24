import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { PinoLogger } from 'nestjs-pino';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact-info')
export class ContactInfoController {
  constructor(
    private readonly contactInfoService: ContactInfoService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('ContactInfoController');
  }

  @Get()
  @Public()
  async getContactInfo() {
    this.logger.info('Accès public à /contact-info');
    return this.contactInfoService.getContactInfo();
  }

  @Patch()
  @Roles(Role.ADMIN)
  async updateContactInfo(@Body() dto: any, @Req() req) {
    this.logger.info('Mise à jour des infos de contact', { userId: req.user.id, ...dto });
    return this.contactInfoService.updateContactInfo(dto);
  }
} 
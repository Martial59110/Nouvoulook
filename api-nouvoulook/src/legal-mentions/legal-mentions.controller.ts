import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { LegalMentionsService } from './legal-mentions.service';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { PinoLogger } from 'nestjs-pino';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('legal-mentions')
export class LegalMentionsController {
  constructor(
    private readonly legalMentionsService: LegalMentionsService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('LegalMentionsController');
  }

  @Get()
  @Public()
  async getLegalMentions() {
    this.logger.info('Accès public à /legal-mentions');
    return this.legalMentionsService.getLegalMentions();
  }

  @Patch()
  @Roles(Role.ADMIN)
  async updateLegalMentions(@Body() dto: any, @Req() req) {
    this.logger.info('Mise à jour des mentions légales', { userId: req.user.id });
    return this.legalMentionsService.updateLegalMentions(dto);
  }
} 
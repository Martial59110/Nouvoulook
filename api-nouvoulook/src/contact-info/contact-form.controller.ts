import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { Public } from 'src/decorators/public.decorator';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ContactFormController {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService
  ) {
    logger.setContext('ContactFormController');
  }

  @Post('contact-form')
  @Public()
  async sendContactForm(@Body() body: any) {
    // Récupérer l'email de réception
    const contact = await this.prisma['contactInfo'].findFirst();
    
    if (!contact?.smtpUser || !contact?.smtpPass) {
      this.logger.error('Configuration SMTP manquante');
      throw new BadRequestException('Configuration SMTP non disponible. Veuillez contacter l\'administrateur.');
    }

    const transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') ?? '',
      port: parseInt(this.configService.get('SMTP_PORT') ?? '587', 10),
      secure: (this.configService.get('SMTP_SECURE') ?? 'false') === 'true',
      auth: {
        user: contact.smtpUser,
        pass: contact.smtpPass
      }
    });
    

    // Construire le contenu du mail
    const html = `
      <h2>Nouveau message du formulaire</h2>
      <p><strong>Type :</strong> ${body.type || 'Contact'}</p>
      <ul>
        ${Object.entries(body)
          .filter(([key]) => !['type', 'sujet'].includes(key))
          .map(([k, v]) => `<li><b>${k} :</b> ${v}</li>`)
          .join('')}
      </ul>
    `;

    try {
      this.logger.info('Tentative d\'envoi du mail', { to: contact.smtpUser, sujet: body.sujet });
      await transporter.sendMail({
        from: contact.smtpUser,
        to: contact.smtpUser,
        subject: body.sujet || 'Nouveau message du site Nouvoulook',
        html
      });
      this.logger.info('Email envoyé avec succès', { type: body.type });
      return { message: 'Message envoyé avec succès !' };
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email: ${error?.message || error}`, { stack: error?.stack, ...error });
      throw new BadRequestException('Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.');
    }
  }
} 
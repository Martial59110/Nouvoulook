import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private prisma: PrismaService, private configService: ConfigService) {}

  async sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const contact = await this.prisma.contactInfo.findFirst();
    if (!contact?.smtpUser || !contact?.smtpPass) {
      throw new Error('Configuration SMTP manquante');
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
    return transporter.sendMail({
      from: contact.smtpUser,
      to,
      subject,
      html
    });
  }
} 
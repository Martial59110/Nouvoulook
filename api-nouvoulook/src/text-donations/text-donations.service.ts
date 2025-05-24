import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTextDonationDto } from './dto/create-text-donation.dto';
import { UpdateTextDonationDto } from './dto/update-text-donation.dto';

@Injectable()
export class TextDonationsService {
  constructor(private prisma: PrismaService) {}

  create(createTextDonationDto: CreateTextDonationDto, userId: string) {
    console.log('Création d\'un nouveau texte de donation');
    return this.prisma.textDonation.create({
      data: {
        ...createTextDonationDto,
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.textDonation.findMany();
  }

  findOne(id: string) {
    return this.prisma.textDonation.findUnique({
      where: { id },
    });
  }

  update(id: string, updateTextDonationDto: UpdateTextDonationDto) {
    console.log('Mise à jour du texte de donation');
    return this.prisma.textDonation.update({
      where: { id },
      data: updateTextDonationDto,
    });
  }

  remove(id: string) {
    console.log('APPEL INATTENDU DE LA SUPPRESSION EN BASE', id);
    return this.prisma.textDonation.delete({
      where: { id },
    });
  }
} 
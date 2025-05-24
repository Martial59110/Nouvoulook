import { Partner } from '../../partners/entities/partner.entity';
import { News } from '../../news/entities/news.entity';
import { TextDonation } from '../../text-donations/entities/text-donation.entity';
import { TextVolunteer } from '../../text-volunteers/entities/text-volunteer.entity';
import { ClothingExample } from '../../clothing-examples/entities/clothing-example.entity';
import { Role } from '../../auth/enums/role.enum';

export class User {
  id: string;
  email: string;
  password: string;
  firstname: string | null;
  lastname: string | null;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  partner: Partner | null;
  news: News[];
  textDonations: TextDonation[];
  textVolunteer: TextVolunteer | null;
  clothingExamples: ClothingExample[];
} 
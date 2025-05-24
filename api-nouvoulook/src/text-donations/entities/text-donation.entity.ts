import { User } from '../../users/entities/user.entity';

export class TextDonation {
  id: string;
  messageSchedule: string;
  messageAdvertising: string;
  imageUrl: string | null;
  flyerPdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  user: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
    roles: string[];
  } | null;
} 
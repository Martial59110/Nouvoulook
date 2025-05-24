import { User } from '../../users/entities/user.entity';

export class TextVolunteer {
  id: string;
  imageUrl: string;
  textContent: string;
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
  flyerPdfUrl?: string | null;
} 
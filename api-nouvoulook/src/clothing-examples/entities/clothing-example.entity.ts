import { User } from '../../users/entities/user.entity';

export class ClothingExample {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  accepted: boolean;
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
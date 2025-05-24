import { User } from '../../users/entities/user.entity';

export class News {
  id: string;
  title: string;
  textContent: string;
  imageUrl: string;
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
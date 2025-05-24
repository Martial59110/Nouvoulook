import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { PinoLogger } from 'nestjs-pino';
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly logger: PinoLogger
  ) {
    logger.setContext('UsersService');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info('Creating new user', { email: createUserDto.email });

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      this.logger.warn('User already exists', { email: createUserDto.email });
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        firstname: createUserDto.firstname,
        lastname: createUserDto.lastname,
        roles: createUserDto.roles || [Role.ADMIN],
      },
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });

    this.logger.info('User created successfully', { id: user.id });
    return user;
  }

  async findAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    const users = await this.prisma.user.findMany({
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });
    this.logger.info(`Found ${users.length} users`);
    return users;
  }

  async findOne(id: string): Promise<User> {
    this.logger.info('Fetching user by id', { id });
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });

    if (!user) {
      this.logger.warn('User not found', { id });
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.info('User found successfully', { id });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.info('Fetching user by email', { email });
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.info('Updating user', { id, ...updateUserDto });
    await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });

    this.logger.info('User updated successfully', { id });
    return updated;
  }

  async remove(id: string): Promise<User> {
    this.logger.info('Removing user', { id });
    await this.findOne(id);

    const deleted = await this.prisma.user.delete({
      where: { id },
      include: {
        partner: {
          include: {
            user: true
          }
        },
        news: {
          include: {
            user: true
          }
        },
        textDonations: {
          include: {
            user: true
          }
        },
        textVolunteer: {
          include: {
            user: true
          }
        },
        clothingExamples: {
          include: {
            user: true
          }
        }
      },
    });

    this.logger.info('User deleted successfully', { id });
    return deleted;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.findOne(userId);
    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Mot de passe actuel incorrect');
    }
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });
    return { message: 'Mot de passe modifié avec succès' };
  }

  async resetPassword(userId: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });
    this.logger.info('Mot de passe réinitialisé pour', { userId });
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
} 
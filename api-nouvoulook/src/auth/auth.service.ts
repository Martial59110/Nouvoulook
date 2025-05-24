import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { Role } from './enums/role.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
    private readonly mailService: MailService,
  ) {
    logger.setContext('AuthService');
  }

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.info('Validating user credentials');
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    this.logger.info('Attempting login', { email: loginDto.email });
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      this.logger.warn('Invalid credentials', { email: loginDto.email });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    this.logger.info('Login successful', { userId: user.id });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    // Dans une implémentation réelle, on pourrait stocker le token dans une blacklist
    // ou le supprimer d'une base de données de tokens actifs
    this.logger.info('User logged out');
    return { message: 'Logged out successfully' };
  }

  async register(registerDto: RegisterDto) {
    this.logger.info('Registering new user', { email: registerDto.email, roles: registerDto.roles });
    const user = await this.usersService.create({
      ...registerDto,
      roles: registerDto.roles || [Role.ADMIN]
    });
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
      },
    };
  }

  async updateToken(userId: string) {
    const user = await this.usersService.findOne(userId);
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles 
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Toujours retourner un message générique pour la sécurité
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
    }
    // Générer un token JWT court (15 min)
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    // Construire le lien de reset
    const frontUrl = this.configService.get('FRONT_URL');
    if (!frontUrl) {
      throw new Error('FRONT_URL must be defined in environment variables');
    }
    const resetLink = `${frontUrl}/reset-password?token=${token}`;
    // Envoi du mail réel
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<p>Bonjour,<br>Pour réinitialiser votre mot de passe, cliquez ici : <a href="${resetLink}">${resetLink}</a><br>Ce lien est valable 15 minutes.</p>`
    });
    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new Error('Utilisateur introuvable');
      }
      return this.usersService.resetPassword(user.id, newPassword);
    } catch (e) {
      throw new UnauthorizedException('Lien invalide ou expiré');
    }
  }
} 
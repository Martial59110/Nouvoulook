import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permissions.create({
      data: createPermissionDto,
    });
  }

  async findAll() {
    return this.prisma.permissions.findMany();
  }

  async findByRole(role: string) {
    return this.prisma.permissions.findMany({
      where: { role },
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permissions.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string) {
    return this.prisma.permissions.delete({
      where: { id },
    });
  }

  async checkPermission(role: string, resource: string, action: string): Promise<boolean> {
    const permission = await this.prisma.permissions.findUnique({
      where: {
        role_resource_action: {
          role,
          resource,
          action,
        },
      },
    });
    return !!permission;
  }
} 
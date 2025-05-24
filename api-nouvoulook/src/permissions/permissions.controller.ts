import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('role/:role')
  @Roles(Role.ADMIN, Role.USER)
  async findByRole(@Param('role') role: string, @Request() req) {
    // Vérifier si l'utilisateur est admin ou s'il demande ses propres permissions
    if (!req.user.roles?.includes(Role.ADMIN) && !req.user.roles?.includes(role)) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à ces permissions');
    }
    return this.permissionsService.findByRole(role);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
} 
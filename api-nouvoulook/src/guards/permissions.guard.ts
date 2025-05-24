import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('--- PermissionsGuard ---');
    console.log('User:', user);
    console.log('User roles:', user?.roles);
    console.log('Required permissions:', requiredPermissions);

    if (!user || !user.roles) {
      console.log('Refusé : pas de user ou pas de roles');
      return false;
    }

    // Vérifier les permissions pour chaque rôle de l'utilisateur
    for (const role of user.roles) {
      for (const permission of requiredPermissions) {
        const [resource, action] = permission.split(':');
        const hasPermission = await this.permissionsService.checkPermission(role, resource, action);
        console.log(`Test permission: role=${role}, resource=${resource}, action=${action} => ${hasPermission}`);
        if (hasPermission) {
          console.log('Permission accordée');
          return true;
        }
      }
    }

    console.log('Permission refusée');
    return false;
  }
} 
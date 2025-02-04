import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from the handler's metadata
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles || requiredRoles.length === 0) return true; // If no roles are required, allow access

    // Extract the user from the request object
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) return false; // Reject if user or role is undefined

    // Check if the user's role matches any of the required roles
    return requiredRoles.includes(user.role);
  }
}

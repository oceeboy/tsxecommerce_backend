import { SetMetadata } from '@nestjs/common';
import { Role } from '../constants/role.enum';

export const Roles = (role: Role, ...additionalRoles: Role[]) =>
  SetMetadata('roles', [role, ...additionalRoles]);

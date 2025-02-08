import { SetMetadata } from '@nestjs/common';

export const Roles = (p0: string, ...roles: []) => SetMetadata('roles', roles);

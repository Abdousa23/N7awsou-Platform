import { SetMetadata } from '@nestjs/common';

export enum Role {
    TOURIST = 'TOURIST',
    GUIDE = 'GUIDE',
    ADMIN = 'ADMIN',
    VENDEUR = 'VENDEUR',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

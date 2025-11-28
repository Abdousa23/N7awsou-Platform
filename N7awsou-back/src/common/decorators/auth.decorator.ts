import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles, Role } from './roles.decorator';
import { AtGuard } from '../guards';

export function Auth(...roles: Role[]) {
    console.log('Auth decorator called with roles:', roles);
    console.log('Using AtGuard and RolesGuard');
    return applyDecorators(
        UseGuards(AtGuard, RolesGuard),
        Roles(...roles),
    );
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/roles.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.sub) {
            throw new ForbiddenException('Access denied. Authentication required.');
        }

        console.log('User role:', user);
        console.log('Required roles:', requiredRoles);
        
        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied. Required roles: ${requiredRoles.join(', ')}. Your role: ${user.role}`
            );
        }

        return true;
    }
}

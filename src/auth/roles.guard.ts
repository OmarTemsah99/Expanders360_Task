import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!required || required.length === 0) return true;

    // Strongly type the request to avoid unsafe `any` usages reported by ESLint.
    interface RequestWithUser extends Request {
      user?: { role?: unknown };
    }

    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const role = req.user?.role;

    // Ensure role is a string before passing to Array.includes which expects string.
    if (!role || typeof role !== 'string') return false;

    return required.includes(role);
  }
}

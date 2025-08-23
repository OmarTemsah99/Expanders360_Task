import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route has @Public() metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(), // method-level
      context.getClass(), // controller-level
    ]);

    if (isPublic) {
      return true; // skip JWT validation
    }

    // otherwise, enforce JWT with the default behavior
    return super.canActivate(context);
  }
}

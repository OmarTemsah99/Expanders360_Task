import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface CurrentUser {
  userId: number;
  role: string;
  email: string;
}

export const CurrentUser = createParamDecorator<
  keyof CurrentUser | undefined,
  CurrentUser | CurrentUser[keyof CurrentUser] | undefined
>((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request & { user?: CurrentUser }>();
  const user = req.user;
  if (!user) return undefined;
  if (data) return user[data];
  return user;
});

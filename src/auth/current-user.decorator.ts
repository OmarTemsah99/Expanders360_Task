import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserPayload {
  userId: number;
  role: string;
  email: string;
}

export const CurrentUser = createParamDecorator<
  keyof CurrentUserPayload | undefined,
  CurrentUserPayload | CurrentUserPayload[keyof CurrentUserPayload] | undefined
>((data, ctx: ExecutionContext) => {
  const req = ctx
    .switchToHttp()
    .getRequest<Request & { user?: CurrentUserPayload }>();
  const user = req.user;
  if (!user) return undefined;
  if (data) return user[data];
  return user;
});

import { IAuthRequest, IUserInfo } from '@domain/types';
import { createParamDecorator } from '@nestjs/common';

export const GetUserInfo = createParamDecorator((_, ctx) => {
  const request: IAuthRequest = ctx.switchToHttp().getRequest();

  return request.userInfo as IUserInfo;
});

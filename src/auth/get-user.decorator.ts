import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from './user.entiry';

export const GetUser = createParamDecorator((data, req): UserEntity => {
  const res = req.args.map((e) => e.user);
  return res[0];
});

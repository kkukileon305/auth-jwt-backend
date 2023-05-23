import { AuthGuard } from '@nestjs/passport';
import { HttpException } from '@nestjs/common';

export class AccessTokenGuard extends AuthGuard('at') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      if (info.message === 'No auth token') {
        throw new HttpException('No auth token', 410);
      }
      throw err || new HttpException(info.message, 406);
    }
    return user;
  }
}

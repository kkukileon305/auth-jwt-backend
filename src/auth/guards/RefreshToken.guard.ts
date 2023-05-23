import { AuthGuard } from '@nestjs/passport';
import { HttpException } from '@nestjs/common';

export class RefreshTokenGuard extends AuthGuard('rt') {
  constructor() {
    super();
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      throw err || new HttpException(info.message, 408);
    }
    return user;
  }
}

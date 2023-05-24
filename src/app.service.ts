import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getMyApp() {
    return {
      name: 'Hello!',
      url: 'Go to "/api" to see the swagger API documentation.',
    };
  }
}

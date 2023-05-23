import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { HttpException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RtJwtStrategy extends PassportStrategy(Strategy, 'rt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      secretOrKey: configService.get('JWT_REFRESH_TOKEN'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
  }

  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      throw new HttpException(err.message, 408);
    }
    return user;
  }

  async validate(req, payload: { userId: string }) {
    const rt = req.headers.authorization.replace('Bearer ', '').trim();

    const { refreshToken } = await this.prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (refreshToken !== rt) {
      throw new HttpException('Invalid refresh token', 408);
    }

    return {
      ...payload,
      refreshToken: rt,
    };
  }
}

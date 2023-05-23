import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { compare, hash } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;

    const hashedPassword = await hash(password, 10);

    await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    return {
      message: 'User created successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 401);
    }

    const isValidPassword = await compare(loginDto.password, user.password);

    if (!isValidPassword) {
      throw new HttpException('Wrong password', 401);
    }

    return {
      ...(await this.getTokens(user.id)),
      userId: user.id,
    };
  }

  async logout(userId: string) {
    await this.updateRefreshTokenInDB(userId, null);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const { password, refreshToken, ...withoutPrivateInfo } = user;

    return withoutPrivateInfo;
  }

  async refreshToken(userId: string) {
    return {
      ...(await this.getTokens(userId)),
      userId,
    };
  }

  async getTokens(userId: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync({ userId }),
      this.jwtService.signAsync(
        { userId },
        {
          expiresIn: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
          secret: this.configService.get('JWT_REFRESH_TOKEN'),
        },
      ),
    ]);

    await this.updateRefreshTokenInDB(userId, rt);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async updateRefreshTokenInDB(userId: string, rt: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: rt,
      },
    });
  }
}

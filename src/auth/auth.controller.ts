import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenGuard } from './guards/RefreshToken.guard';
import { AccessTokenGuard } from './guards/AccessToken.guard';

@Controller('/api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Req() req: Request) {
    return this.authService.refreshToken(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Body() body: LogoutDto, @Res() response: Response) {
    if (!body.userId) {
      return response.status(400).send({
        message: 'Bad request',
      });
    }

    await this.authService.logout(body.userId);

    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');

    return response.send({
      message: 'Logout successful',
    });
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('profile')
  async me(@Req() req: Request) {
    return this.authService.getMe(req.user.userId);
  }
}

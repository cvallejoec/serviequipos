import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Id } from '../../../common/domain';
import type { Request, Response } from 'express';
import { GoogleAuthUserHandler } from '../../../contexts/iam/users/application/google-auth-user/GoogleAuthUserHandler';
import { GoogleAuthUserCommand } from '../../../contexts/iam/users/application/google-auth-user/GoogleAuthUserCommand';
import { GoogleProfile } from '../../../contexts/iam/auth/infrastructure/strategies/google.strategy';
import { MicrosoftProfile } from '../../../contexts/iam/auth/infrastructure/strategies/microsoft.strategy';
import { RequestOtpCommandHandler } from '../../../contexts/iam/otp/application/request/RequestOtpCommandHandler';
import { RequestOtpCommand } from '../../../contexts/iam/otp/application/request/RequestOtpCommand';
import { AuthenticateByOtpCommandHandler } from '../../../contexts/iam/auth/application/otp-authenticator/AuthenticateByOtpCommandHandler';
import { AuthenticateByOtpCommand } from '../../../contexts/iam/auth/application/otp-authenticator/AuthenticateByOtpCommand';
import { RequestOtpDto } from '../dtos/auth/RequestOtpDto';
import { VerifyOtpDto } from '../dtos/auth/VerifyOtpDto';

interface AuthTokenResponse {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    profileCompleted: boolean;
  };
}

@Controller('iam/auth')
export class AuthController {
  constructor(
    private readonly googleAuthUserHandler: GoogleAuthUserHandler,
    private readonly requestOtpHandler: RequestOtpCommandHandler,
    private readonly authenticateByOtpHandler: AuthenticateByOtpCommandHandler,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {
    // Redirects to Google — handled by Passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const profile = req.user as GoogleProfile;
    await this.completeOAuthLogin(profile, res);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  microsoftLogin(): void {
    // Redirects to Microsoft — handled by Passport
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const profile = req.user as MicrosoftProfile;
    await this.completeOAuthLogin(profile, res);
  }

  // Flujo compartido por los proveedores OAuth (Google, Microsoft):
  // crea/encuentra el usuario, emite el JWT y redirige al callback del front.
  private async completeOAuthLogin(
    profile: GoogleProfile | MicrosoftProfile,
    res: Response,
  ): Promise<void> {
    const user = await this.googleAuthUserHandler.execute(
      new GoogleAuthUserCommand(
        Id.random().value,
        profile.firstName,
        profile.lastName,
        profile.email,
        profile.picture ?? null,
      ),
    );

    const primitives = user.toPrimitives();
    const accessToken = this.jwtService.sign({
      sub: primitives.id,
      email: primitives.email,
    });

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
    const params = new URLSearchParams({
      token: accessToken,
      userId: primitives.id,
      firstName: primitives.firstName,
      lastName: primitives.lastName,
      email: primitives.email,
      profileCompleted: String(primitives.profileCompleted),
    });
    if (primitives.avatar) params.set('avatar', primitives.avatar);
    res.redirect(`${frontendUrl}/login/callback?${params.toString()}`);
  }

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<{ success: boolean }> {
    await this.requestOtpHandler.execute(
      new RequestOtpCommand(Id.random().value, dto.email),
    );
    return { success: true };
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthTokenResponse> {
    const user = await this.authenticateByOtpHandler.execute(
      new AuthenticateByOtpCommand(dto.email, dto.code),
    );

    const primitives = user.toPrimitives();
    const accessToken = this.jwtService.sign({
      sub: primitives.id,
      email: primitives.email,
    });

    return {
      accessToken,
      user: {
        id: primitives.id,
        firstName: primitives.firstName,
        lastName: primitives.lastName,
        email: primitives.email,
        avatar: primitives.avatar,
        profileCompleted: primitives.profileCompleted,
      },
    };
  }
}

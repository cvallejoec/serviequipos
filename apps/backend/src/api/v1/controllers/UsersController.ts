import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { CompleteProfileCommandHandler } from '../../../contexts/iam/users/application/profile-completer/CompleteProfileCommandHandler';
import { CompleteProfileCommand } from '../../../contexts/iam/users/application/profile-completer/CompleteProfileCommand';
import { FindUserByIdQueryHandler } from '../../../contexts/iam/users/application/finder/FindUserByIdQueryHandler';
import { FindUserByIdQuery } from '../../../contexts/iam/users/application/finder/FindUserByIdQuery';
import { CompleteProfileDto } from '../dtos/users/CompleteProfileDto';

interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  profileCompleted: boolean;
}

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('iam/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly completeProfileHandler: CompleteProfileCommandHandler,
    private readonly findUserByIdHandler: FindUserByIdQueryHandler,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: Request): Promise<UserProfileResponse> {
    const payload = req.user as JwtPayload;
    const user = await this.findUserByIdHandler.execute(
      new FindUserByIdQuery(payload.sub),
    );
    return this.toResponse(user);
  }

  @Post('me/profile')
  @HttpCode(HttpStatus.OK)
  async completeProfile(
    @Req() req: Request,
    @Body() dto: CompleteProfileDto,
  ): Promise<UserProfileResponse> {
    const payload = req.user as JwtPayload;
    const user = await this.completeProfileHandler.execute(
      new CompleteProfileCommand(
        payload.sub,
        dto.firstName,
        dto.lastName,
        dto.phone,
      ),
    );
    return this.toResponse(user);
  }

  private toResponse(
    user: Awaited<ReturnType<FindUserByIdQueryHandler['execute']>>,
  ): UserProfileResponse {
    const primitives = user.toPrimitives();
    return {
      id: primitives.id,
      firstName: primitives.firstName,
      lastName: primitives.lastName,
      email: primitives.email,
      phone: primitives.phone.toPrimitive() ?? null,
      avatar: primitives.avatar,
      profileCompleted: primitives.profileCompleted,
    };
  }
}

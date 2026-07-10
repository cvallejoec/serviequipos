import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { IsString } from 'class-validator';
import { Maybe } from '../../../common/domain';
import { JwtPayload } from '../../../contexts/iam/auth/infrastructure/strategies/jwt.strategy';
import {
  USER_REPOSITORY,
  UserRepository,
} from '../../../contexts/iam/users/domain/UserRepository';
import { UserId } from '../../../contexts/iam/users/domain/value-objects/UserId';
import { UpdateUserProfileCommandHandler } from '../../../contexts/iam/users/application/updater/UpdateUserProfileCommandHandler';
import { UpdateUserProfileCommand } from '../../../contexts/iam/users/application/updater/UpdateUserProfileCommand';
import { ChangeUserAvatarCommandHandler } from '../../../contexts/iam/users/application/avatar-changer/ChangeUserAvatarCommandHandler';
import { ChangeUserAvatarCommand } from '../../../contexts/iam/users/application/avatar-changer/ChangeUserAvatarCommand';

class UpdateProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  gender: string;

  @IsString()
  birthday: string;
}

interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: string | null;
  birthday: string | null;
  avatar: string | null;
  profileCompleted: boolean;
}

interface UploadedAvatarFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const AVATAR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

@Controller('me')
@UseGuards(AuthGuard('jwt'))
export class MeController {
  constructor(
    private readonly updateUserProfileHandler: UpdateUserProfileCommandHandler,
    private readonly changeUserAvatarHandler: ChangeUserAvatarCommandHandler,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @Get('profile')
  async getProfile(@Req() req: Request): Promise<ProfileResponse> {
    const payload = req.user as JwtPayload;
    const user = await this.userRepository.findById(new UserId(payload.sub));
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.toProfileResponse(user.toPrimitives());
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const payload = req.user as JwtPayload;
    const user = await this.updateUserProfileHandler.execute(
      new UpdateUserProfileCommand(
        payload.sub,
        dto.firstName,
        dto.lastName,
        dto.phone,
        dto.gender,
        dto.birthday,
      ),
    );
    return this.toProfileResponse(user.toPrimitives());
  }

  @Patch('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: AVATAR_UPLOAD_MAX_BYTES },
    }),
  )
  async updateAvatar(
    @Req() req: Request,
    @UploadedFile() file: UploadedAvatarFile | undefined,
  ): Promise<ProfileResponse> {
    if (!file) {
      throw new BadRequestException(
        'Adjunta una imagen en el campo "avatar" del formulario.',
      );
    }
    const payload = req.user as JwtPayload;
    const user = await this.changeUserAvatarHandler.execute(
      new ChangeUserAvatarCommand(payload.sub, file.buffer, file.mimetype),
    );
    return this.toProfileResponse(user.toPrimitives());
  }

  private toProfileResponse(p: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: Maybe<string>;
    gender: Maybe<string>;
    birthday: Maybe<Date>;
    avatar: string | null;
    profileCompleted: boolean;
  }): ProfileResponse {
    return {
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone.toPrimitive() ?? null,
      gender: p.gender.toPrimitive() ?? null,
      birthday: p.birthday.toPrimitive()?.toISOString().slice(0, 10) ?? null,
      avatar: p.avatar,
      profileCompleted: p.profileCompleted,
    };
  }
}

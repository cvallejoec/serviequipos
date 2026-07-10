import { IsEmail } from 'class-validator';

export class RequestOtpDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;
}

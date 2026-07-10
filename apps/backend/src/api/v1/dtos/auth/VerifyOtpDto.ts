import { IsEmail, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @Matches(/^\d{6}$/, { message: 'El código debe ser de 6 dígitos' })
  code: string;
}

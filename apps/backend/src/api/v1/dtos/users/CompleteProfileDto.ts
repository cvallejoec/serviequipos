import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, {
    message: 'El apellido no puede superar los 100 caracteres',
  })
  lastName: string;

  @Matches(/^\+[1-9]\d{7,14}$/, {
    message: 'El número de teléfono no tiene un formato válido',
  })
  phone: string;
}

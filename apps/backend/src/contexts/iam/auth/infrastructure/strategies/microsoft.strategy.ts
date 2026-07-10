import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

// Callback `done` de Passport-OAuth2. Lo declaramos localmente porque
// `@types/passport-microsoft` no reexporta el tipo y `passport-oauth2` es
// solo una dependencia transitiva (no resoluble como import directo).
export type MicrosoftVerifyCallback = (
  error: Error | null,
  user?: unknown,
) => void;

export interface MicrosoftProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string | undefined;
}

// Perfil normalizado que expone passport-microsoft a partir de Microsoft
// Graph (`/me`). La librería no lo tipa, así que declaramos aquí solo los
// campos que consumimos.
export interface MicrosoftGraphProfile {
  id: string;
  displayName?: string;
  name?: { givenName?: string; familyName?: string };
  userPrincipalName?: string;
  emails?: Array<{ type?: string; value: string }>;
}

// Valores por defecto cuando Microsoft no entrega nombre/apellido (algunas
// cuentas personales solo traen displayName). Reutilizamos los mismos que el
// flujo de OTP para no violar el mínimo de 2 caracteres de los value objects.
const DEFAULT_FIRST_NAME = 'Usuario';
const DEFAULT_LAST_NAME = 'Nuevo';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('MICROSOFT_CALLBACK_URL'),
      // 'common' permite cuentas de organización y personales
      // (@outlook/@hotmail). Se puede restringir poniendo el Tenant ID.
      tenant: configService.get<string>('MICROSOFT_TENANT', 'common'),
      scope: ['openid', 'profile', 'email', 'User.Read'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: MicrosoftGraphProfile,
    done: MicrosoftVerifyCallback,
  ): void {
    done(null, normalizeMicrosoftProfile(profile));
  }
}

// Convierte el perfil crudo de Graph al shape que consumen los controladores.
// Garantiza nombre/apellido con al menos 2 caracteres (fallback a displayName
// y, en último caso, a los valores por defecto) para no romper los value
// objects UserFirstName/UserLastName.
export function normalizeMicrosoftProfile(
  profile: MicrosoftGraphProfile,
): MicrosoftProfile {
  const [firstFromDisplay = '', ...restFromDisplay] = (
    profile.displayName ?? ''
  )
    .trim()
    .split(/\s+/);

  const firstName = pickName(
    profile.name?.givenName,
    firstFromDisplay,
    DEFAULT_FIRST_NAME,
  );
  const lastName = pickName(
    profile.name?.familyName,
    restFromDisplay.join(' '),
    DEFAULT_LAST_NAME,
  );

  return {
    id: profile.id,
    // Cuentas personales suelen no traer `mail`; en ese caso el
    // userPrincipalName es el correo real del usuario.
    email: profile.emails?.[0]?.value ?? profile.userPrincipalName ?? '',
    firstName,
    lastName,
    // Graph `/me` no devuelve URL de foto (es un endpoint binario aparte),
    // así que dejamos que el handler genere el avatar por defecto.
    picture: undefined,
  };
}

function pickName(
  primary: string | undefined,
  fallback: string,
  defaultValue: string,
): string {
  const candidate = (primary ?? '').trim();
  if (candidate.length >= 2) return candidate;
  const alt = fallback.trim();
  if (alt.length >= 2) return alt;
  return defaultValue;
}

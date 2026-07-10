import type { SessionUser } from "./session";

export type AuthenticatedUser = SessionUser;

/**
 * Decide a dónde enviar al usuario recién autenticado. Si venía de una URL
 * protegida (returnUrl válido y relativo), lo devolvemos allí; de lo
 * contrario cae en el área privada por defecto.
 */
export function chooseAuthDestination(
  _user: SessionUser,
  honoredRedirect?: string | null,
): string {
  if (
    honoredRedirect &&
    honoredRedirect.startsWith("/") &&
    !honoredRedirect.startsWith("//")
  ) {
    return honoredRedirect;
  }
  return "/dashboard";
}

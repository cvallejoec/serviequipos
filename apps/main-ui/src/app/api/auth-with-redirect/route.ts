import { NextRequest, NextResponse } from "next/server";

const POST_LOGIN_REDIRECT_COOKIE = "serviequipos_post_login";
const COOKIE_MAX_AGE = 60 * 30; // 30 minutos: tiempo de holgura para completar el login

/**
 * Redirige al /login dejando en cookie el destino al que el usuario debe
 * regresar tras autenticarse. El callback de OAuth y el magic link honoran
 * esa cookie vía chooseAuthDestination.
 *
 * Solo aceptamos destinos *relativos* (que empiecen con `/`) para evitar
 * open-redirect.
 */
export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const to = searchParams.get("to");

  const safeTo =
    to && to.startsWith("/") && !to.startsWith("//") ? to : "/dashboard";

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(POST_LOGIN_REDIRECT_COOKIE, safeTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

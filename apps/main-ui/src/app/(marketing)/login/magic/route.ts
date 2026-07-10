import { NextRequest, NextResponse } from "next/server";
import { endpoints } from "@/lib/endpoints";
import { chooseAuthDestination, type AuthenticatedUser } from "@/lib/post-auth";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/session";

const POST_LOGIN_REDIRECT_COOKIE = "serviequipos_post_login";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  if (!email || !code) {
    return NextResponse.redirect(
      new URL("/login?error=magic_invalid", request.url),
    );
  }

  let token: string;
  let user: AuthenticatedUser;
  try {
    const res = await fetch(endpoints.auth.otpVerify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) {
      return NextResponse.redirect(
        new URL("/login?error=magic_expired", request.url),
      );
    }
    const data = (await res.json()) as {
      accessToken: string;
      user: AuthenticatedUser;
    };
    token = data.accessToken;
    user = data.user;
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const base = {
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };

  const postLoginCookie = request.cookies.get(
    POST_LOGIN_REDIRECT_COOKIE,
  )?.value;
  const honoredRedirect =
    postLoginCookie &&
    postLoginCookie.startsWith("/") &&
    !postLoginCookie.startsWith("//")
      ? postLoginCookie
      : null;

  const destination = chooseAuthDestination(user, honoredRedirect);
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(TOKEN_COOKIE, token, { ...base, httpOnly: true });
  response.cookies.set(USER_COOKIE, JSON.stringify(user), {
    ...base,
    httpOnly: false,
  });
  if (postLoginCookie) {
    response.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);
  }

  return response;
}

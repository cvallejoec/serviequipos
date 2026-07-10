import { NextRequest, NextResponse } from "next/server";
import { chooseAuthDestination } from "@/lib/post-auth";
import { TOKEN_COOKIE, USER_COOKIE, type SessionUser } from "@/lib/session";

const POST_LOGIN_REDIRECT_COOKIE = "serviequipos_post_login";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const token = searchParams.get("token");
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");
  const firstName = searchParams.get("firstName") ?? "";
  const lastName = searchParams.get("lastName") ?? "";
  const avatar = searchParams.get("avatar");
  const profileCompleted = searchParams.get("profileCompleted") === "true";

  if (!token || !userId || !email) {
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.url),
    );
  }

  const sessionUser: SessionUser = {
    id: userId,
    firstName,
    lastName,
    email,
    avatar,
    profileCompleted,
  };

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

  const destination = chooseAuthDestination(sessionUser, honoredRedirect);
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.set(TOKEN_COOKIE, token, { ...base, httpOnly: true });
  response.cookies.set(USER_COOKIE, JSON.stringify(sessionUser), {
    ...base,
    httpOnly: false,
  });
  if (postLoginCookie) {
    response.cookies.delete(POST_LOGIN_REDIRECT_COOKIE);
  }

  return response;
}

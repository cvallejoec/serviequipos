import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/session";

const POST_LOGIN_REDIRECT_COOKIE = "serviequipos_post_login";
const REDIRECT_MAX_AGE = 60 * 30; // 30 min

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const userJson = request.cookies.get(USER_COOKIE)?.value;
  const isAuthenticated = Boolean(token) && Boolean(userJson);

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  // Usuario no autenticado intentando entrar al área privada → login,
  // preservando el destino para volver tras autenticarse.
  if (!isAuthenticated && isProtected) {
    const response = redirect(request, "/login");
    response.cookies.set(POST_LOGIN_REDIRECT_COOKIE, pathname, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: REDIRECT_MAX_AGE,
      path: "/",
    });
    return response;
  }

  // Usuario autenticado que vuelve al login → directo al área privada.
  if (isAuthenticated && pathname.startsWith("/login")) {
    const returnUrl = request.nextUrl.searchParams.get("returnUrl");
    const safeReturn =
      returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
        ? returnUrl
        : "/dashboard";
    return redirect(request, safeReturn);
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  const [redirectPath, redirectQuery] = path.split("?");
  url.pathname = redirectPath ?? path;
  url.search = redirectQuery ? `?${redirectQuery}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/login/:path*", "/dashboard/:path*", "/profile/:path*"],
};

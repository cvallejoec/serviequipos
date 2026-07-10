import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  profileCompleted: boolean;
};

export const TOKEN_COOKIE = "serviequipos_token";
export const USER_COOKIE = "serviequipos_user";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export async function getSession(): Promise<{
  token: string;
  user: SessionUser;
} | null> {
  const store = await cookies();
  const token = store.get(TOKEN_COOKIE)?.value;
  const userJson = store.get(USER_COOKIE)?.value;

  if (!token || !userJson) return null;

  try {
    const user = JSON.parse(userJson) as SessionUser;
    return { token, user };
  } catch {
    return null;
  }
}

export async function createSession(params: {
  token: string;
  user: SessionUser;
}): Promise<void> {
  const store = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  store.set(TOKEN_COOKIE, params.token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  store.set(USER_COOKIE, JSON.stringify(params.user), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}

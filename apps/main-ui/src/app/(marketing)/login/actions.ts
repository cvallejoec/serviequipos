"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { endpoints } from "@/lib/endpoints";
import { createSession, type SessionUser } from "@/lib/session";
import { chooseAuthDestination } from "@/lib/post-auth";

const POST_LOGIN_REDIRECT_COOKIE = "serviequipos_post_login";

async function readAndClearPostLoginRedirect(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(POST_LOGIN_REDIRECT_COOKIE)?.value;
  if (value) store.delete(POST_LOGIN_REDIRECT_COOKIE);
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : null;
}

export type OtpRequestState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

export type OtpVerifyState =
  | { status: "idle" }
  | { status: "error"; message: string };

export async function requestOwnerOtp(email: string): Promise<OtpRequestState> {
  const trimmed = email.trim();
  if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
    return { status: "error", message: "Ingresa un correo válido" };
  }

  try {
    const res = await fetch(endpoints.auth.otpRequest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });
    if (!res.ok) {
      if (res.status === 429) {
        return {
          status: "error",
          message: "Demasiados intentos. Espera unos minutos.",
        };
      }
      const body = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        status: "error",
        message:
          body?.message ?? "No pudimos enviar el código. Intenta de nuevo.",
      };
    }
    return { status: "sent", email: trimmed };
  } catch {
    return { status: "error", message: "No pudimos conectar con el servidor." };
  }
}

export async function verifyOwnerOtp(
  email: string,
  code: string,
): Promise<OtpVerifyState> {
  if (!/^\d{6}$/.test(code)) {
    return { status: "error", message: "El código debe ser de 6 dígitos" };
  }

  let destination = "/login";
  try {
    const res = await fetch(endpoints.auth.otpVerify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string;
      } | null;
      return {
        status: "error",
        message: body?.message ?? "Código inválido o expirado",
      };
    }

    const data = (await res.json()) as {
      accessToken: string;
      user: SessionUser;
    };

    await createSession({ token: data.accessToken, user: data.user });
    const postLoginRedirect = await readAndClearPostLoginRedirect();
    destination = chooseAuthDestination(data.user, postLoginRedirect);
  } catch {
    return { status: "error", message: "No pudimos conectar con el servidor." };
  }

  redirect(destination);
}

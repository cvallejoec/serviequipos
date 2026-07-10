import type { Metadata } from "next";
import Link from "next/link";
import { endpoints } from "@/lib/endpoints";
import { Logo } from "@/components/Logo";
import { LoginCard } from "./LoginCard";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const googleAuthUrl = endpoints.auth.googleLogin;
  const microsoftAuthUrl = endpoints.auth.microsoftLogin;

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-10">
        <Logo size="md" />
      </Link>

      <div
        className="bg-card w-full max-w-sm rounded-2xl border border-ink/10 p-8"
        style={{ boxShadow: "0 4px 24px rgba(28,20,9,0.07)" }}
      >
        <div className="mb-7">
          <h1 className="font-display font-bold text-2xl text-ink mb-2">
            Accede a tu cuenta
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Si eres nuevo, tu cuenta se crea automáticamente.
          </p>
        </div>

        <ErrorBanner searchParams={searchParams} />

        <LoginCard googleUrl={googleAuthUrl} microsoftUrl={microsoftAuthUrl} />
      </div>

      <p className="text-muted text-xs mt-6 text-center max-w-xs leading-relaxed">
        Al continuar aceptas nuestros{" "}
        <Link
          href="#"
          className="underline underline-offset-2 hover:text-ink-soft"
        >
          Términos de Uso
        </Link>{" "}
        y{" "}
        <Link
          href="#"
          className="underline underline-offset-2 hover:text-ink-soft"
        >
          Política de Privacidad
        </Link>
        .
      </p>
    </div>
  );
}

async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;

  const messages: Record<string, string> = {
    auth_failed: "No pudimos completar el inicio de sesión. Intenta de nuevo.",
    session_expired: "Tu sesión expiró. Vuelve a iniciar sesión.",
    magic_invalid: "El enlace no es válido. Solicita un nuevo código.",
    magic_expired: "El enlace expiró o ya se usó. Solicita un nuevo código.",
  };

  return (
    <div className="mb-5 bg-terracotta/10 border border-terracotta/20 text-terracotta text-sm rounded-xl px-4 py-3">
      {messages[error] ?? "Algo salió mal. Intenta de nuevo."}
    </div>
  );
}

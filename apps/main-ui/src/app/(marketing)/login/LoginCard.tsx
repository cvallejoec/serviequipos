"use client";

import { useState, useTransition } from "react";
import { GoogleButton } from "./GoogleButton";
import { MicrosoftButton } from "./MicrosoftButton";
import { OtpInput } from "./OtpInput";
import { requestOwnerOtp, verifyOwnerOtp } from "./actions";

type LoginCardProps = {
  googleUrl: string;
  microsoftUrl: string;
};

export function LoginCard({ googleUrl, microsoftUrl }: LoginCardProps) {
  const [step, setStep] = useState<"choose" | "otp">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Cooldown de reenvío (mismo criterio que el registro del cliente): evita
  // que se gaste la cuota de OTP con reenvíos rápidos y da feedback claro.
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((n) => {
        if (n <= 1) {
          clearInterval(timer);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  };

  const handleSendCode = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestOwnerOtp(email);
      if (result.status === "error") {
        setError(result.message);
      } else if (result.status === "sent") {
        setEmail(result.email);
        setStep("otp");
        startResendCooldown();
      }
    });
  };

  const handleVerify = () => {
    setError(null);
    startTransition(async () => {
      const result = await verifyOwnerOtp(email, code);
      if (result?.status === "error") {
        setError(result.message);
      }
      // En caso de éxito, verifyOwnerOtp redirige y no retorna.
    });
  };

  const handleResend = () => {
    setError(null);
    setCode("");
    startTransition(async () => {
      const result = await requestOwnerOtp(email);
      if (result.status === "error") {
        setError(result.message);
      } else {
        startResendCooldown();
      }
    });
  };

  if (step === "otp") {
    return (
      <div className="space-y-5" data-track-form="login-otp">
        <div>
          <h2 className="font-display font-bold text-xl text-ink mb-2">
            Revisa tu correo
          </h2>
          <p className="text-muted text-sm leading-relaxed">
            Te enviamos un código a{" "}
            <span className="text-ink font-medium">{email}</span>. También
            recibirás un botón para acceder con un solo clic.
          </p>
        </div>

        {error && (
          <div className="bg-terracotta/10 border border-terracotta/20 text-terracotta text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <OtpInput value={code} onChange={setCode} disabled={isPending} />

        <button
          type="button"
          onClick={handleVerify}
          disabled={isPending || code.length !== 6}
          className="w-full bg-terracotta text-parchment rounded-xl px-4 py-3.5 text-sm font-medium hover:bg-terracotta/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Verificando…" : "Verificar"}
        </button>

        <div className="flex items-center justify-between text-xs text-muted">
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setCode("");
              setError(null);
            }}
            className="underline underline-offset-2 hover:text-ink-soft"
          >
            Cambiar correo
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending || resendCooldown > 0}
            className="underline underline-offset-2 hover:text-ink-soft disabled:opacity-50 disabled:no-underline"
          >
            {resendCooldown > 0
              ? `Reenviar en ${resendCooldown}s`
              : "Reenviar código"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-track-form="login">
      {error && (
        <div className="bg-terracotta/10 border border-terracotta/20 text-terracotta text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <GoogleButton href={googleUrl} />
        <MicrosoftButton href={microsoftUrl} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-ink/8" />
        <span className="text-xs text-muted">o</span>
        <div className="flex-1 h-px bg-ink/8" />
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@negocio.com"
          disabled={isPending}
          className="w-full bg-card border border-ink/12 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isPending || !email}
          className="w-full bg-ink text-parchment rounded-xl px-4 py-3 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Enviando…" : "Continuar con Correo"}
        </button>
      </div>
    </div>
  );
}

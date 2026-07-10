"use client";

import { useState } from "react";

export function MicrosoftButton({ href }: { href: string }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <a
      href={href}
      onClick={() => setIsPending(true)}
      aria-disabled={isPending}
      className={`flex items-center justify-center gap-3 w-full bg-white border border-ink/12 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        isPending
          ? "opacity-60 pointer-events-none text-muted"
          : "text-ink-soft hover:bg-parchment-dim"
      }`}
      style={{ boxShadow: "0 1px 4px rgba(28,20,9,0.06)" }}
    >
      {isPending ? <SpinnerIcon /> : <MicrosoftLogo />}
      {isPending ? "Redirigiendo a Microsoft..." : "Continuar con Microsoft"}
    </a>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="animate-spin"
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M9 2a7 7 0 0 1 7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1h7.6v7.6H1V1z" fill="#F25022" />
      <path d="M9.4 1H17v7.6H9.4V1z" fill="#7FBA00" />
      <path d="M1 9.4h7.6V17H1V9.4z" fill="#00A4EF" />
      <path d="M9.4 9.4H17V17H9.4V9.4z" fill="#FFB900" />
    </svg>
  );
}

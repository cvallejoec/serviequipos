"use client";

import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

type OtpInputProps = {
  value: string;
  onChange: (next: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus = true,
  disabled = false,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setDigit = (idx: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length > 1) {
      // multi-char: autocomplete del browser o paste via onChange en Android
      const next = Array.from({ length }, (_, i) => cleaned[i] ?? "");
      onChange(next.join(""));
      refs.current[Math.min(cleaned.length, length - 1)]?.focus();
      return;
    }
    const digit = cleaned;
    const next = digits.slice();
    next[idx] = digit;
    onChange(next.join(""));
    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => setDigit(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold tabular-nums bg-card border border-ink/12 rounded-xl focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}

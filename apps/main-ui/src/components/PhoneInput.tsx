"use client";

import { useMemo, useState } from "react";

type Country = {
  iso: string;
  flag: string;
  dial: string;
  nationalLength: number;
  mobilePrefix: string;
  enabled: boolean;
};

const ECUADOR: Country = {
  iso: "EC",
  flag: "🇪🇨",
  dial: "+593",
  nationalLength: 9,
  mobilePrefix: "9",
  enabled: true,
};

const COUNTRIES: Country[] = [
  ECUADOR,
  // Otros países quedan deshabilitados hasta que soportemos validación y
  // formateo por país. Se mantienen en código para activarlos rápido cuando
  // se requiera.
  // {
  //   iso: "CO",
  //   flag: "🇨🇴",
  //   dial: "+57",
  //   nationalLength: 10,
  //   mobilePrefix: "3",
  //   enabled: false,
  // },
  // {
  //   iso: "PE",
  //   flag: "🇵🇪",
  //   dial: "+51",
  //   nationalLength: 9,
  //   mobilePrefix: "9",
  //   enabled: false,
  // },
  // {
  //   iso: "CL",
  //   flag: "🇨🇱",
  //   dial: "+56",
  //   nationalLength: 9,
  //   mobilePrefix: "9",
  //   enabled: false,
  // },
  // {
  //   iso: "AR",
  //   flag: "🇦🇷",
  //   dial: "+54",
  //   nationalLength: 10,
  //   mobilePrefix: "9",
  //   enabled: false,
  // },
  // {
  //   iso: "MX",
  //   flag: "🇲🇽",
  //   dial: "+52",
  //   nationalLength: 10,
  //   mobilePrefix: "",
  //   enabled: false,
  // },
  // {
  //   iso: "BO",
  //   flag: "🇧🇴",
  //   dial: "+591",
  //   nationalLength: 8,
  //   mobilePrefix: "",
  //   enabled: false,
  // },
  // {
  //   iso: "BR",
  //   flag: "🇧🇷",
  //   dial: "+55",
  //   nationalLength: 11,
  //   mobilePrefix: "",
  //   enabled: false,
  // },
  // {
  //   iso: "UY",
  //   flag: "🇺🇾",
  //   dial: "+598",
  //   nationalLength: 9,
  //   mobilePrefix: "9",
  //   enabled: false,
  // },
  // {
  //   iso: "PY",
  //   flag: "🇵🇾",
  //   dial: "+595",
  //   nationalLength: 9,
  //   mobilePrefix: "",
  //   enabled: false,
  // },
  // {
  //   iso: "VE",
  //   flag: "🇻🇪",
  //   dial: "+58",
  //   nationalLength: 10,
  //   mobilePrefix: "",
  //   enabled: false,
  // },
];

const DEFAULT_COUNTRY = ECUADOR;

function formatEcuadorPhone(digits: string): string {
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
}

function parseEcuadorInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("593") && digits.length >= 12) {
    return digits.slice(3, 12);
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return digits.slice(1);
  }
  if (digits.length === 9) return digits;
  return digits.slice(0, 9);
}

function isValidEcuadorNational(national: string): boolean {
  return national.length === 9 && national.startsWith("9");
}

function parseE164ToNational(e164: string, country: Country): string {
  if (!e164.startsWith(country.dial)) return "";
  return e164.slice(country.dial.length);
}

export type PhoneInputProps = {
  value: string;
  onChange: (e164: string | "") => void;
  error?: string;
  required?: boolean;
  label?: string;
  disabled?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  error,
  required,
  label = "Teléfono",
  disabled,
}: PhoneInputProps) {
  const initialNational = useMemo(
    () => parseE164ToNational(value, DEFAULT_COUNTRY),
    [value],
  );
  const [national, setNational] = useState(initialNational);
  const [touched, setTouched] = useState(false);

  const handleChange = (raw: string) => {
    const parsed = parseEcuadorInput(raw);
    setNational(parsed);
    if (isValidEcuadorNational(parsed)) {
      onChange(`${DEFAULT_COUNTRY.dial}${parsed}`);
    } else {
      onChange("");
    }
  };

  const showError =
    (touched && national.length > 0 && !isValidEcuadorNational(national)) ||
    Boolean(error);
  const errorMessage =
    error ??
    (touched && national.length > 0 && !isValidEcuadorNational(national)
      ? "Ingresa 9 dígitos (ej. 0998877766 o 998877766)"
      : "");

  return (
    <div>
      <label className="block text-xs text-muted mb-1 px-1">
        {label}
        {required ? " *" : ""}
      </label>
      <div className="flex gap-2 min-w-0">
        <select
          value={DEFAULT_COUNTRY.dial}
          onChange={() => {
            /* Por ahora solo Ecuador está habilitado */
          }}
          disabled={disabled}
          aria-label="Código de país"
          className="w-22 shrink-0 bg-card border border-ink/12 rounded-xl px-2 py-3 text-sm text-ink focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.dial} disabled={!c.enabled}>
              {c.flag} {c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={formatEcuadorPhone(national)}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="99 999 9999"
          required={required}
          disabled={disabled}
          className="flex-1 min-w-0 bg-card border border-ink/12 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-terracotta transition-colors tabular-nums disabled:opacity-50"
        />
      </div>
      {showError && errorMessage && (
        <p className="text-xs text-red-500 mt-1 px-1">{errorMessage}</p>
      )}
    </div>
  );
}

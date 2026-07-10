"use client";

import { useEffect, useMemo, useState } from "react";

interface BirthdayPickerProps {
  /** Fecha en formato `YYYY-MM-DD`, o cadena vacía si aún no se ingresa. */
  value: string;
  /**
   * Se invoca con `YYYY-MM-DD` cuando los tres selectores tienen valor, o
   * con cadena vacía mientras la fecha esté incompleta.
   */
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Año máximo seleccionable. Por defecto, el año actual. */
  maxYear?: number;
  /**
   * Año mínimo seleccionable. Por defecto, año actual - 100 (suficiente
   * para cualquier fecha de nacimiento real).
   */
  minYear?: number;
}

const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const SELECT_CLASS =
  "w-full bg-card border border-ink/12 rounded-xl px-3 py-3 text-sm text-ink focus:outline-none focus:border-terracotta transition-colors disabled:opacity-50";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

interface Parts {
  day: string;
  month: string;
  year: string;
}

function partsFromValue(value: string | undefined): Parts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return {
    year: match?.[1] ?? "",
    month: match?.[2] ?? "",
    day: match?.[3] ?? "",
  };
}

function partsToValue(parts: Parts): string {
  if (!parts.day || !parts.month || !parts.year) return "";
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function BirthdayPicker({
  value,
  onChange,
  disabled = false,
  maxYear,
  minYear,
}: BirthdayPickerProps) {
  const currentYear = new Date().getFullYear();
  const yearMax = maxYear ?? currentYear;
  const yearMin = minYear ?? currentYear - 100;

  // Estado interno para selecciones parciales (cuando el usuario solo eligió
  // 1 o 2 de los 3 selectores, la fecha aún no es válida y no podemos
  // serializarla al padre). Inicializamos desde `value` si viene completo.
  const [parts, setParts] = useState<Parts>(() => partsFromValue(value));

  // Si el padre cambia `value` externamente (ej.: reset de formulario),
  // sincronizamos el estado interno.
  useEffect(() => {
    if (value !== partsToValue(parts)) {
      setParts(partsFromValue(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = yearMax; y >= yearMin; y--) list.push(y);
    return list;
  }, [yearMax, yearMin]);

  const dayCount = useMemo(() => {
    if (!parts.year || !parts.month) return 31;
    return daysInMonth(Number(parts.year), Number(parts.month));
  }, [parts.year, parts.month]);

  function update(next: Parts) {
    // Si el día seleccionado no existe en el nuevo mes/año (ej.: Feb 30),
    // lo recortamos al último día válido.
    if (next.day && next.month && next.year) {
      const max = daysInMonth(Number(next.year), Number(next.month));
      if (Number(next.day) > max) {
        next = { ...next, day: String(max).padStart(2, "0") };
      }
    }
    setParts(next);
    onChange(partsToValue(next));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        aria-label="Día"
        value={parts.day}
        onChange={(e) => update({ ...parts, day: e.target.value })}
        disabled={disabled}
        className={SELECT_CLASS}
      >
        <option value="">Día</option>
        {Array.from({ length: dayCount }, (_, i) => {
          const d = String(i + 1).padStart(2, "0");
          return (
            <option key={d} value={d}>
              {i + 1}
            </option>
          );
        })}
      </select>

      <select
        aria-label="Mes"
        value={parts.month}
        onChange={(e) => update({ ...parts, month: e.target.value })}
        disabled={disabled}
        className={SELECT_CLASS}
      >
        <option value="">Mes</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Año"
        value={parts.year}
        onChange={(e) => update({ ...parts, year: e.target.value })}
        disabled={disabled}
        className={SELECT_CLASS}
      >
        <option value="">Año</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

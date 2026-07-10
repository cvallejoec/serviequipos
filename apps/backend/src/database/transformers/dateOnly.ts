/**
 * Transformer para columnas Postgres `date` (sin hora) en TypeORM.
 *
 * Sin esto, el driver `pg` formatea la `Date` JS usando la zona horaria
 * *local del servidor*, lo que desplaza el día completo cuando el proceso
 * corre en TZ != UTC (caso típico: Ecuador UTC-5 → un día menos).
 *
 * Al guardar serializa con componentes UTC (`YYYY-MM-DD`). Al leer, ancla
 * la fecha a mediodía UTC para que cualquier conversión posterior a TZ
 * local conserve el mismo día calendario.
 */
export const DATE_ONLY_TRANSFORMER = {
  to: (value: Date | null | undefined): string | null => {
    if (value === null || value === undefined) return null;
    return value.toISOString().slice(0, 10);
  },
  from: (value: string | Date | null): Date | null => {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) {
      // Cuando el driver ya parseó a Date usando TZ local, re-anclamos
      // tomando sus componentes locales y tratándolos como UTC.
      const y = value.getFullYear();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      const d = value.getDate().toString().padStart(2, '0');
      return new Date(`${y}-${m}-${d}T12:00:00Z`);
    }
    return new Date(`${value}T12:00:00Z`);
  },
};

/**
 * Helper para parsear `YYYY-MM-DD` que llega del frontend. Lo ancla a
 * mediodía UTC para sobrevivir cualquier ajuste de TZ sin cambiar el día.
 */
export function parseIsoDate(value: string): Date {
  return new Date(`${value}T12:00:00Z`);
}

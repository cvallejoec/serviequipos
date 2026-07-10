import type { Request } from 'express';

/**
 * Extrae la IP del cliente respetando los headers que setean los reverse
 * proxies más comunes (Cloudflare, nginx, Cloud Run, etc.).
 *
 * Orden de prioridad — el primero que tenga valor gana:
 *   1. cf-connecting-ip   (Cloudflare)
 *   2. true-client-ip     (Akamai / Cloudflare Enterprise)
 *   3. x-real-ip          (nginx por defecto)
 *   4. x-forwarded-for    (estándar de facto; tomamos el primer hop)
 *   5. req.ip             (Express; respeta `trust proxy` si está set)
 *   6. req.socket.remoteAddress
 *
 * Si el deployment no setea ningún header de proxy, vamos a leer la IP de
 * loopback del propio proxy hablando con el backend (::1 / 127.0.0.1) — es
 * el síntoma clásico de "todas las IPs son localhost".
 *
 * Devuelve la IP truncada a 45 chars (largo máx. de una IPv6 con scope).
 */
export function extractClientIp(req: Request): string | null {
  const candidates = [
    pickHeader(req, 'cf-connecting-ip'),
    pickHeader(req, 'true-client-ip'),
    pickHeader(req, 'x-real-ip'),
    pickFirstForwarded(req),
    req.ip ?? null,
    req.socket?.remoteAddress ?? null,
  ];

  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip) return ip.slice(0, 45);
  }
  return null;
}

function pickHeader(req: Request, name: string): string | null {
  const raw = req.headers[name];
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function pickFirstForwarded(req: Request): string | null {
  const raw = req.headers['x-forwarded-for'];
  if (!raw) return null;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value.split(',')[0] ?? null;
}

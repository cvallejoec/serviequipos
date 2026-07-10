import type { Request } from 'express';
import { extractClientIp } from '../../../../src/api/v1/utils/extract-client-ip';

/** Construye un `Request` falso con los headers/campos relevantes. */
const requestWith = (
  overrides: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    remoteAddress?: string;
  } = {},
): Request =>
  ({
    headers: overrides.headers ?? {},
    ip: overrides.ip,
    socket: { remoteAddress: overrides.remoteAddress } as any,
  }) as unknown as Request;

describe('extractClientIp', () => {
  it('prioriza cf-connecting-ip por encima del resto', () => {
    const req = requestWith({
      headers: {
        'cf-connecting-ip': '203.0.113.10',
        'x-real-ip': '10.0.0.1',
        'x-forwarded-for': '198.51.100.1',
      },
      ip: '127.0.0.1',
    });

    expect(extractClientIp(req)).toBe('203.0.113.10');
  });

  it('usa true-client-ip cuando no hay cf-connecting-ip', () => {
    const req = requestWith({
      headers: { 'true-client-ip': '203.0.113.20', 'x-real-ip': '10.0.0.1' },
    });

    expect(extractClientIp(req)).toBe('203.0.113.20');
  });

  it('usa x-real-ip cuando no hay headers de mayor prioridad', () => {
    const req = requestWith({ headers: { 'x-real-ip': '192.0.2.5' } });

    expect(extractClientIp(req)).toBe('192.0.2.5');
  });

  it('toma el primer hop de x-forwarded-for', () => {
    const req = requestWith({
      headers: { 'x-forwarded-for': '198.51.100.7, 10.0.0.1, 10.0.0.2' },
    });

    expect(extractClientIp(req)).toBe('198.51.100.7');
  });

  it('cae a req.ip cuando no hay headers de proxy', () => {
    const req = requestWith({ ip: '203.0.113.99' });

    expect(extractClientIp(req)).toBe('203.0.113.99');
  });

  it('cae a socket.remoteAddress como último recurso', () => {
    const req = requestWith({ remoteAddress: '::1' });

    expect(extractClientIp(req)).toBe('::1');
  });

  it('devuelve null cuando no hay ninguna fuente de IP', () => {
    expect(extractClientIp(requestWith())).toBeNull();
  });

  it('toma el primer elemento cuando el header viene como array', () => {
    const req = requestWith({
      headers: { 'cf-connecting-ip': ['203.0.113.30', '203.0.113.31'] },
    });

    expect(extractClientIp(req)).toBe('203.0.113.30');
  });

  it('recorta el valor (trim) del header', () => {
    const req = requestWith({ headers: { 'x-real-ip': '  192.0.2.8  ' } });

    expect(extractClientIp(req)).toBe('192.0.2.8');
  });

  it('salta candidatos vacíos/whitespace hasta el primero con valor', () => {
    const req = requestWith({
      headers: { 'x-real-ip': '   ' },
      ip: '203.0.113.77',
    });

    expect(extractClientIp(req)).toBe('203.0.113.77');
  });

  it('trunca la IP a 45 caracteres', () => {
    const longValue = '2001:db8:'.repeat(10);
    const req = requestWith({ headers: { 'x-real-ip': longValue } });

    expect(extractClientIp(req)).toHaveLength(45);
  });
});

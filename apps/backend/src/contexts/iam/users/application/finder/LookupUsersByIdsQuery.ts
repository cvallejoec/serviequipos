/**
 * Query liviana para resolver usuarios por una lista de IDs. Existe para
 * enriquecer respuestas con la identidad del usuario desde otros contextos
 * (por ejemplo, "quién selló esta cartilla"). La autorización del endpoint
 * que termina exponiendo estos datos vive en la capa de controller/guard,
 * no aquí.
 */
export class LookupUsersByIdsQuery {
  constructor(public readonly ids: string[]) {}
}

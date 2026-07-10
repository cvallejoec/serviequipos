# serviequipos

Monorepo boilerplate con **pnpm** + **Turborepo**.

Consulta [PROJECT.md](./PROJECT.md) para la descripción del proyecto y el estado
actual del boilerplate.

## Estructura

- `apps/backend` — API en NestJS (DDD) sobre PostgreSQL con TypeORM.
- `apps/main-ui` — Frontend en Next.js (App Router) con Tailwind CSS.
- `packages/eslint-config` — Configuración compartida de ESLint.
- `packages/typescript-config` — Configuración compartida de TypeScript.

## Requisitos

- Node.js >= 18
- pnpm 9
- PostgreSQL

## Puesta en marcha

```sh
pnpm install

# Copia y completa las variables de entorno del backend
cp apps/backend/.env.example apps/backend/.env

pnpm dev        # levanta backend + frontend
```

## Scripts (raíz)

- `pnpm dev` — desarrollo (todas las apps vía Turborepo).
- `pnpm build` — build de producción.
- `pnpm lint` — lint.
- `pnpm check-types` — verificación de tipos.
- `pnpm format` — formatea con Prettier.

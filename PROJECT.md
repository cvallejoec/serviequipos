# serviequipos

> Describe aquí el producto: el problema que resuelve, sus audiencias y su visión.
> Este documento arranca como un placeholder — reemplázalo con la definición real
> del proyecto a medida que la vayas construyendo.

## Estado actual

Este repositorio es un **boilerplate** listo para construir, derivado de una app
previa. Incluye la infraestructura base y ningún feature de negocio.

Ya viene resuelto:

- **Autenticación**: registro/login vía Google, Microsoft y OTP por correo
  (con magic link). Sesión por cookie httpOnly + JWT.
- **Usuarios**: perfil, edición y avatar.
- **Storage de archivos**: adaptador S3-compatible (Digital Ocean Spaces) para
  subir imágenes (ej. avatares).
- **Frontend**: landing, pantalla de login, área privada con layout diferenciado
  móvil/escritorio, y TanStack Query configurado.

## Arquitectura, a alto nivel

Monorepo gestionado con **pnpm** + **Turborepo**:

- `apps/backend` — API en **NestJS** con arquitectura DDD (contextos →
  subdominios → `domain`/`application`/`infrastructure`). Persistencia con
  **TypeORM** sobre **PostgreSQL**.
- `apps/main-ui` — Frontend en **Next.js** (App Router) con **Tailwind CSS**.
- `packages/*` — Configuraciones compartidas de ESLint y TypeScript.

## Cómo empezar

1. Copia los `.env.example` de cada app a `.env` y complétalos.
2. Instala dependencias: `pnpm install`.
3. Levanta todo en desarrollo: `pnpm dev`.

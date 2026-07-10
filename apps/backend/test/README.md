# Pruebas del backend

Tres niveles, cada uno con su configuración y su comando. La meta es que
**cada feature quede cubierto**: dominio y aplicación con unitarias,
persistencia con integración, y el contrato HTTP con e2e.

| Nivel       | Qué prueba                                    | Toca BD | Runner | Patrón de archivo       | Comando                 |
| ----------- | --------------------------------------------- | :-----: | ------ | ----------------------- | ----------------------- |
| Unitario    | Value objects, agregados, eventos, handlers   |   No    | SWC    | `*.spec.ts`             | `pnpm test`             |
| Integración | Repositorios TypeORM (mapeo dominio⇄persist.) |   Sí    | SWC    | `*.integration.spec.ts` | `pnpm test:integration` |
| E2E         | Endpoints HTTP de punta a punta               |   Sí    | SWC    | `*.e2e-spec.ts`         | `pnpm test:e2e`         |

- `pnpm test:watch` — unitarias en watch.
- `pnpm test:cov` — unitarias con reporte de cobertura.
- `pnpm test:all` — corre los tres niveles en secuencia.

## Transpilación con SWC

Los tres niveles usan **SWC** (`@swc/jest`), la misma cadena que el build de
producción (`nest build -b swc`), para que los tests ejerciten exactamente lo
que corre en runtime. SWC emite metadata de decorador `Object` para los tipos
union `X | null`, así que las entidades TypeORM declaran `type` explícito en
esas columnas (ver `database/entities/`) y no dependen de la metadata reflejada
—si no, fallarían con `Data type "Object" ... is not supported`.

`@faker-js/faker` v10 es ESM puro: el `transformIgnorePatterns` del preset lo
des-ignora para transpilarlo a CommonJS. Importa faker por su
locale (`@faker-js/faker/locale/en`), no por el índice, para no transpilar
todos los idiomas.

## Base de datos para integración y e2e

Necesitas una Postgres **desechable** (las suites la limpian en cada test).

1. Crea la base:
   ```bash
   createdb serviequipos_test        # o: CREATE DATABASE serviequipos_test;
   ```
2. Copia las credenciales a un `.env.test.local` (gitignoreado) en la raíz del
   backend:
   ```env
   TEST_DB_HOST=localhost
   TEST_DB_PORT=5432
   TEST_DB_USERNAME=postgres
   TEST_DB_PASSWORD=postgres
   TEST_DB_NAME=serviequipos_test
   TEST_DB_SCHEMA=public
   ```
   `test/setup/load-env.ts` carga, en orden de prioridad: `.env.test.local` →
   `.env.test` → `.env`.

El esquema se crea solo desde las entidades (`synchronize: true`), así que no
dependes de migraciones. **Nunca** apuntes `TEST_DB_*` a una base con datos
reales.

## Estructura de `test/`

```
test/
├── jest.preset.js              # transforms + patrón faker compartidos
├── jest-integration.js         # config integración (SWC)
├── jest-e2e.js                 # config e2e (SWC)
├── tsconfig.json               # tsconfig de test (type-check del editor)
├── test-database.module.ts     # config TypeORM de test + cleanDatabase()
├── setup/load-env.ts           # carga TEST_DB_* antes de cada suite
├── builders/                   # object mothers (UserBuilder, ...)
├── mocks/                      # dobles de puertos (repos, EmailSender, ...)
├── e2e/
│   ├── setup/test-app.module.ts  # módulo Nest aislado para e2e
│   └── contexts/...              # *.e2e-spec.ts
├── integration/contexts/...      # *.integration.spec.ts
└── contexts/... , common/...     # *.spec.ts (unitarias, espejo de src/)
```

> La config de las unitarias vive en `jest.config.js` (raíz del backend).

## Cómo cubrir un feature nuevo

Al crear un agregado/caso de uso, agrega en paralelo:

1. **Unitarias de dominio** — un `*.spec.ts` por value object (casos válidos e
   inválidos) y uno para el agregado (factory, invariantes, eventos que
   registra, round-trip `fromPrimitives`/`toPrimitives`).
2. **Unitarias de aplicación** — un `*.spec.ts` por handler, con el repositorio
   y los puertos mockeados (`test/mocks/`). Cubre el camino feliz y cada error.
3. Un **builder** en `test/builders/` y, si hace falta, un **mock** en
   `test/mocks/` para el nuevo repositorio/puerto.
4. **Integración** — un `*.integration.spec.ts` para el `TypeOrm<Repo>`, y suma
   la entidad a `test-database.module.ts` (`testEntities` + `tableCleanupOrder`).
5. **E2E** — un `*.e2e-spec.ts` por controller. Registra sus providers/handlers
   en `e2e/setup/test-app.module.ts` (con dobles para servicios externos) y
   sobreescribe las guardas de auth con `.overrideGuard(...)`.

Usa el slice de **IAM/users** como plantilla: cubre los cinco puntos.

```
test/contexts/iam/users/**          (unitarias)
test/integration/contexts/iam/users (integración)
test/e2e/contexts/iam/users.e2e-spec.ts (e2e)
```

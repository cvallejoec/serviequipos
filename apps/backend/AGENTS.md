- Aún no cuenta con un sistema de query/command bus, por lo que la comunicación entre casos de uso se hace directamente.
- Siempre ocupa CUID1 para la generación de IDs. Para generarlos siempre llama al value object de ID, nunca se llama directamente a la función.
- Ten cuidado al almacenar datos de tipo fecha (sin hora). Ya que corremos el riesgo de que al guardar, por temas relacionado a zona horaria se guarde un día antes o después, dependiendo de la zona horaria del servidor
- El tiempo se obtiene SIEMPRE a través del puerto `Clock` (`common/domain`), nunca con `new Date()` en dominio/aplicación. Los factories/métodos de agregado reciben el `Clock` como parámetro (`User.create(params, clock)`, `otp.markUsed(clock)`); los handlers/servicios/repos lo inyectan con `@Inject(CLOCK)`. En producción se registra `SystemClock` vía el `ClockModule` global; en tests se usa `FixedClock` (`test/mocks/ClockMock.ts`) para congelar el tiempo y poder asertar el objeto completo con `toEqual`. Excepción razonable: value objects que validan un rango contra "ahora" (ej. `UserBirthday`) pueden usar `new Date()` para no romper su pureza.

# Reglas

- Cada agregado debe ser creado como submódulo dentro del contexto
- Cada agregado tiene su propio repositorio
- Un caso de uso modifica típicamente un agregado
- Cada contexto es un módulo de nestjs, y dentro habrán submódulos
- Submódulos por cada agregado (dentro tendrán domain, application, infrastructure)
- Errores siempre en español
- Comentarios/documentación en español
- En capa de infraestructura, para implementar el repositorio, el archivo se debe llamar: "TypeOrm<repo_name>". Siempre se debe ocupar mappers para parsear de dominio-persistencia y persistencia-dominio
- Las interfaces no deben llevar el prefijo "I" y solamente tener el nombre como tal de la interfaz, para que de esa manera en la implementación se obligue a colocar como nombre la razón de la implementación. Por ejemplo: UserRepository -> TypeOrmRepository; Notifier -> EmailNotifier
- Un caso de uso siempre recibe value objects y retorna un agregado (si lo necesita), pero a su vez es el handler el encargado de parsear entre primitivos-dominio y dominio-primitivos
- Los casos de uso tendrán esta conjugación del verbo: finder, creator, updater, etc. -- Ejemplo de nombres de carpeta application: creator |-- CreateUserCommand |-- CreateUserCommandHandler |-- user-creator.service.ts
- En la raíz de “aplication” se crea un index que exportará solo comandos y queries de los casos de uso
- El agregado en su mayoría de casos no tendrá getters ni setters
- Un agregado no tiene propiedades que puedan ser null, cuando se quiera ocuparlas, se debe hacer el uso del value object Maybe<>, así mismo los primitivos ocuparán Maybe. Será solo el QueryResponse el encargado de parsear el maybe a un null.
- Un controlador NUNCA llama a un repositorio, se comunica a través de Query/Command bus
- Un caso de uso SOLAMENTE puede llamar/invocar a su propio repositorio del agregado, si se quiere comunicar con otro modulo lo hace a través del query/command bus

# Pruebas

- Todo feature debe quedar cubierto en tres niveles. Guía completa en `test/README.md`; el slice de IAM/users es la plantilla a copiar.
- Aplica principios de TDD, especialmente la TRIANGULACIÓN, y de esta manera no tengamos falsos positivos.
- **Unitarias** (`*.spec.ts`, corren con SWC, sin BD): un spec por value object (casos válidos e inválidos), uno por agregado (factory, invariantes, eventos, round-trip primitivos) y uno por handler (con repos/puertos mockeados desde `test/mocks/`, camino feliz + cada error). Comando: `pnpm test`.
- **Integración** (`*.integration.spec.ts`, SWC, Postgres real): un spec por `TypeOrm<Repo>`. Al crear una entidad, súmala a `test/test-database.module.ts` (`testEntities` y `tableCleanupOrder`). Comando: `pnpm test:integration`.
- **E2E** (`*.e2e-spec.ts`, SWC, Postgres real): un spec por controller. Registra sus handlers/providers en `test/e2e/setup/test-app.module.ts` con dobles para servicios externos (SendGrid, Spaces...) y sobreescribe las guardas de auth. Comando: `pnpm test:e2e`.
- Datos de prueba: usa builders en `test/builders/` (con `@faker-js/faker`, importado por locale: `@faker-js/faker/locale/en`).
- Integración/e2e requieren una Postgres desechable vía `TEST_DB_*` (ver `.env.example` y `test/README.md`). Nunca apuntes esas variables a una base con datos reales.
- Los tres niveles: `pnpm test:all`.

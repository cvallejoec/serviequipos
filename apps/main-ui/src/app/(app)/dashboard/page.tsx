import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.user.firstName ?? "";

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-display font-semibold text-ink">
        Hola{firstName ? `, ${firstName}` : ""} 👋
      </h1>
      <p className="mt-2 text-muted">
        Este es el punto de partida de serviequipos. Reemplaza esta pantalla con
        el panel principal de tu aplicación.
      </p>
    </div>
  );
}

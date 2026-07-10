import Link from "next/link";
import { Logo } from "@/components/Logo";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-sm border-b border-ink/8">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <Link
            href="/login"
            className="text-sm font-medium bg-terracotta text-parchment px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink">
          serviequipos
        </h1>
        <p className="mt-4 text-lg text-muted">
          Boilerplate listo para construir. Reemplaza esta landing con la página
          principal de tu producto.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block text-sm font-medium bg-terracotta text-parchment px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Comenzar
          </Link>
        </div>
      </main>
    </>
  );
}

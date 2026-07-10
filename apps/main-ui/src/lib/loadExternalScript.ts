/**
 * Carga un <script> externo idempotente desde el cliente. Si el script
 * ya está cargado (presente en `document.head`), resuelve inmediatamente.
 *
 * No usar para módulos `import` — esto es para SDKs externos que se
 * adhieren a `window.<Algo>` (como la cajita de PayPhone).
 */
export function loadExternalScript(src: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("loadExternalScript solo puede usarse en cliente"),
    );
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${src}"]`,
  );
  if (existing) {
    if (existing.dataset.loaded === "true") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error(`No se pudo cargar el script: ${src}`)),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    });
    script.addEventListener("error", () =>
      reject(new Error(`No se pudo cargar el script: ${src}`)),
    );
    document.head.appendChild(script);
  });
}

/**
 * Carga un <link rel="stylesheet"> idempotente.
 */
export function loadExternalStylesheet(href: string): void {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

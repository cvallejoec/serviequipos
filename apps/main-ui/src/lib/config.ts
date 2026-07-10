// Configuración general de la aplicación. Centraliza valores fijos del producto
// (datos de contacto, soporte, etc.) en un solo lugar para evitar magic strings
// repartidos por el código.
export const config = {
  support: {
    email: "hola@serviequipos.com",
    // Número en formato internacional sin símbolos (para wa.me). Ej: 593991234567
    whatsapp: "",
    whatsappMessage: "Hola, necesito ayuda con mi cuenta.",
  },
} as const;

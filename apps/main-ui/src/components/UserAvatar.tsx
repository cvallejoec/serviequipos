import Image from "next/image";

type Props = {
  src?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
};

/**
 * Foto de perfil del usuario. Si `src` está presente, muestra la imagen
 * en círculo; si no, cae en las iniciales sobre un fondo terracota.
 *
 * Se evita `next/image` con un loader remoto porque la URL puede venir
 * tanto de nuestro bucket como de Google. Para evitar configurar dominios
 * caso por caso, usamos `unoptimized` cuando renderiza la foto.
 */
export function UserAvatar({
  src,
  firstName,
  lastName,
  size = 32,
  className = "",
}: Props) {
  const initials =
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
  const dimension = { width: size, height: size };
  const fontSize = Math.max(10, Math.round(size * 0.4));

  if (src) {
    return (
      <span
        className={`relative inline-block rounded-full overflow-hidden bg-parchment-dim flex-shrink-0 ${className}`}
        style={dimension}
      >
        <Image
          src={src}
          alt={`${firstName} ${lastName}`}
          width={size}
          height={size}
          unoptimized
          className="object-cover w-full h-full"
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-terracotta/15 flex-shrink-0 ${className}`}
      style={dimension}
    >
      <span
        className="font-display font-bold text-terracotta"
        style={{ fontSize }}
      >
        {initials}
      </span>
    </span>
  );
}

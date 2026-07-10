type LogoSize = "sm" | "md" | "lg";

const textSizes: Record<LogoSize, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ size = "md" }: { size?: LogoSize }) {
  return (
    <span
      className={`font-display font-bold tracking-tight text-ink ${textSizes[size]}`}
    >
      serviequipos
    </span>
  );
}

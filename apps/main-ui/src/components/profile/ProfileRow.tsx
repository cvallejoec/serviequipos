import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "default" | "destructive";

export type ProfileRowProps = {
  icon: ReactNode;
  label: string;
  value?: string;
  rightSlot?: ReactNode;
  tone?: Tone;
  showChevron?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function ProfileRow({
  icon,
  label,
  value,
  rightSlot,
  tone = "default",
  showChevron,
  href,
  onClick,
  type,
}: ProfileRowProps) {
  const interactive = !!href || !!onClick || type === "submit";
  // Destructive actions (logout) don't navigate — drop the chevron by default.
  const chevron = showChevron ?? (interactive && tone !== "destructive");

  const labelClass =
    tone === "destructive"
      ? "text-sm font-medium text-red-600"
      : "text-sm font-medium text-ink";

  const iconWrapperClass =
    tone === "destructive"
      ? "bg-red-500/10 text-red-600"
      : "bg-terracotta/10 text-terracotta";

  const inner = (
    <>
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconWrapperClass}`}
      >
        {icon}
      </span>
      <span className={`flex-1 min-w-0 truncate ${labelClass}`}>{label}</span>
      {value && (
        <span className="text-sm text-muted shrink-0 truncate max-w-[40%]">
          {value}
        </span>
      )}
      {rightSlot}
      {chevron && <ChevronIcon />}
    </>
  );

  const baseClass =
    "flex items-center gap-3 px-4 py-3.5 w-full text-left transition-colors";
  const interactiveClass = interactive ? "hover:bg-parchment-dim" : "";
  const fullClass = `${baseClass} ${interactiveClass}`;

  if (href) {
    return (
      <Link href={href} className={fullClass}>
        {inner}
      </Link>
    );
  }

  if (type === "submit") {
    return (
      <button type="submit" className={fullClass}>
        {inner}
      </button>
    );
  }

  if (onClick) {
    return (
      <button type={type ?? "button"} onClick={onClick} className={fullClass}>
        {inner}
      </button>
    );
  }

  return <div className={fullClass}>{inner}</div>;
}

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="text-muted shrink-0"
    >
      <path
        d="M7 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav";
import { logout } from "@/app/(app)/actions";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="relative shrink-0 bg-parchment border-t border-ink/8"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? "text-terracotta" : "text-muted"
              }`}
            >
              <NavIcon itemKey={item.key} active={isActive} />
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ itemKey, active }: { itemKey: string; active: boolean }) {
  const color = active ? "#c2603d" : "#8c7a5e";
  const fill = active ? `${color}20` : "none";

  switch (itemKey) {
    case "dashboard":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 9.5L11 3L19 9.5V19H14V14H8V19H3V9.5Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fill}
          />
        </svg>
      );
    case "profile":
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="8"
            r="3.5"
            stroke={color}
            strokeWidth="1.5"
            fill={fill}
          />
          <path
            d="M4 19c0-3.5 3.1-6 7-6s7 2.5 7 6"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill={fill}
          />
        </svg>
      );
    default:
      return null;
  }
}

export { logout };

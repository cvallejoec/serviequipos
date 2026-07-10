"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav";
import { logout } from "@/app/(app)/actions";
import type { SessionUser } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";

export function DesktopSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-parchment border-r border-ink/8">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center flex-shrink-0 border-b border-ink/6">
        <Logo size="sm" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-muted hover:bg-parchment-dim hover:text-ink-soft"
              }`}
            >
              <SidebarIcon itemKey={item.key} active={isActive} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Usuario — clickable hacia el perfil */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-ink/8 flex items-center gap-3">
        <Link
          href="/profile"
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          title="Ver perfil"
        >
          <UserAvatar
            src={user.avatar}
            firstName={user.firstName}
            lastName={user.lastName}
            size={32}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink-soft truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[11px] text-muted truncate">{user.email}</p>
          </div>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="text-muted hover:text-ink-soft transition-colors flex-shrink-0 p-1"
          >
            <LogoutIcon />
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarIcon({
  itemKey,
  active,
}: {
  itemKey: string;
  active: boolean;
}) {
  const color = active ? "#c2603d" : "#8c7a5e";
  const fill = active ? `${color}20` : "none";

  switch (itemKey) {
    case "dashboard":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z"
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
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="5.5"
            r="2.5"
            stroke={color}
            strokeWidth="1.5"
            fill={fill}
          />
          <path
            d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"
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

function LogoutIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 2.5H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2.5M10 10.5l3-3-3-3M13 7.5H6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

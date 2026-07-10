import type { SessionUser } from "@/lib/session";
import { DesktopSidebar } from "./DesktopSidebar";

export function DesktopLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  return (
    <div className="flex h-full w-full">
      <DesktopSidebar user={user} />
      <main className="flex-1 overflow-y-auto bg-parchment">{children}</main>
    </div>
  );
}

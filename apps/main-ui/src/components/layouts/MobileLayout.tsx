import type { SessionUser } from "@/lib/session";
import { MobileNav } from "./MobileNav";

export function MobileLayout({
  children,
}: {
  children: React.ReactNode;
  user: SessionUser;
}) {
  return (
    <div className="flex flex-col h-full bg-parchment">
      <main className="flex-1 overflow-y-auto pb-10">{children}</main>
      <MobileNav />
    </div>
  );
}

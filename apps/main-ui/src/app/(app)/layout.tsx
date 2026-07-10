import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DesktopLayout } from "@/components/layouts/DesktopLayout";
import { MobileLayout } from "@/components/layouts/MobileLayout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { user } = session;

  return (
    <div className="h-dvh w-full">
      {/* Desktop */}
      <div className="hidden md:flex h-full">
        <DesktopLayout user={user}>{children}</DesktopLayout>
      </div>
      {/* Mobile */}
      <div className="flex md:hidden h-full">
        <MobileLayout user={user}>{children}</MobileLayout>
      </div>
    </div>
  );
}

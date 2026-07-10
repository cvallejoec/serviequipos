import { getSession } from "@/lib/session";
import { logout } from "@/app/(app)/actions";
import { UserAvatar } from "@/components/UserAvatar";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProfileRow } from "@/components/profile/ProfileRow";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="flex items-center gap-4 mb-6">
        <UserAvatar
          src={user?.avatar ?? null}
          firstName={user?.firstName ?? ""}
          lastName={user?.lastName ?? ""}
          size={56}
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-ink truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-muted truncate">{user?.email}</p>
        </div>
      </div>

      <ProfileSection title="Cuenta">
        <ProfileRow
          icon={<span className="text-xs font-semibold">@</span>}
          label="Correo"
          value={user?.email}
        />
      </ProfileSection>

      <ProfileSection>
        <form action={logout}>
          <ProfileRow
            icon={<LogoutIcon />}
            label="Cerrar sesión"
            tone="destructive"
            type="submit"
          />
        </form>
      </ProfileSection>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
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

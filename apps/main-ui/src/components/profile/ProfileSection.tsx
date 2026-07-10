import type { ReactNode } from "react";

export function ProfileSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      {title && (
        <h2 className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-2">
          {title}
        </h2>
      )}
      <div className="bg-card border border-ink/8 rounded-2xl overflow-hidden divide-y divide-ink/6">
        {children}
      </div>
    </section>
  );
}

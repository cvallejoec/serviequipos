export type NavItem = {
  key: string;
  href: string;
  label: string;
};

export const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Inicio" },
  { key: "profile", href: "/profile", label: "Perfil" },
];

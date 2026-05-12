import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestion des cookies",
  description: "Politique d'utilisation des cookies sur la plateforme Voyago.",
};

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

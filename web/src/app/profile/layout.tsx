import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Gérez vos informations personnelles et préférences sur Voyago.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

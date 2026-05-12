import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Inscrivez-vous sur Voyago pour réserver vos billets de bus au Togo en quelques clics.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

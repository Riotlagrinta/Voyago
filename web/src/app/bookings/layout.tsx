import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes réservations",
  description: "Consultez et gérez toutes vos réservations de bus sur Voyago.",
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

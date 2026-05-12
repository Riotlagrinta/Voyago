import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rechercher un trajet",
  description: "Trouvez et comparez les trajets de bus disponibles au Togo. Filtrez par ville, date et compagnie.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

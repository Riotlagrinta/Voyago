import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Voyago — collecte, utilisation et protection de vos données personnelles.",
};

export default function ConfidentialiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

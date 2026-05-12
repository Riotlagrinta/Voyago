import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme Voyago — éditeur, hébergeur et informations juridiques.",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

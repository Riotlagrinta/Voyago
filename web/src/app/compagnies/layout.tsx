import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compagnies de transport",
  description: "Découvrez toutes les compagnies de transport routier disponibles sur Voyago au Togo.",
};

export default function CompagniesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

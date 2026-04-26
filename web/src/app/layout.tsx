import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Voyago",
    default: "Voyago - Plateforme de transport routier au Togo",
  },
  description: "Réservez vos places de bus en toute sécurité partout au Togo. Payez par T-Money ou Flooz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-primary/10 selection:text-primary transition-colors duration-300">
        {children}
        <Toaster position="bottom-right" richColors closeButton expand={false} />
      </body>
    </html>
  );
}

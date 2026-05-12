"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-[60] border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-primary">Voyago</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Retour à l&apos;accueil</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black mb-2 text-foreground tracking-tight">Mentions légales</h1>
        <p className="text-foreground/40 text-sm mb-12">Dernière mise à jour : mai 2026</p>

        <div className="prose prose-sm max-w-none space-y-10 text-foreground/70">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Éditeur du site</h2>
            <p>Le site Voyago est édité par la société <strong>Voyago Togo</strong>, dont le siège est situé à Lomé, Togo.</p>
            <p>Email de contact : <a href="mailto:contact@voyago.tg" className="text-primary hover:underline">contact@voyago.tg</a></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Hébergement</h2>
            <p>Le site est hébergé par <strong>Vercel Inc.</strong> et la base de données par <strong>Supabase Inc.</strong></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Propriété intellectuelle</h2>
            <p>L&apos;ensemble des contenus présents sur Voyago (textes, images, logos, code source) est la propriété exclusive de Voyago Togo et est protégé par la législation en vigueur sur la propriété intellectuelle.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Responsabilité</h2>
            <p>Voyago ne pourra être tenu responsable des dommages directs ou indirects causés au matériel de l&apos;utilisateur lors de l&apos;accès au site, ni des dommages indirects suite à l&apos;utilisation du site.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Droit applicable</h2>
            <p>Tout litige relatif à l&apos;utilisation du site est soumis au droit togolais. Les tribunaux compétents sont ceux de Lomé, Togo.</p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 text-sm text-foreground/40 border-t border-border pt-8">
          <Link href="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          <Link href="/cookies" className="hover:text-primary transition-colors">Gestion des cookies</Link>
        </div>
      </main>
    </div>
  );
}

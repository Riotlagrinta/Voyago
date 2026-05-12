"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CookiesPage() {
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
        <h1 className="text-4xl font-black mb-2 text-foreground tracking-tight">Gestion des cookies</h1>
        <p className="text-foreground/40 text-sm mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-foreground/70 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite sur un site web. Il permet de mémoriser certaines informations pour améliorer votre expérience de navigation.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Cookies utilisés par Voyago</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-surface-50">
                <h3 className="font-bold text-foreground mb-1">Cookies essentiels</h3>
                <p>Indispensables au fonctionnement du site. Ils permettent la gestion de votre session et de votre authentification. Ils ne peuvent pas être désactivés.</p>
                <p className="mt-2 text-xs text-foreground/40">Exemples : jeton d&apos;authentification JWT, session invité</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-50">
                <h3 className="font-bold text-foreground mb-1">Cookies de préférences</h3>
                <p>Mémorisent vos préférences de navigation (langue, thème). Ils améliorent votre confort d&apos;utilisation.</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface-50">
                <h3 className="font-bold text-foreground mb-1">Cookies analytiques</h3>
                <p>Collectent des données anonymes sur l&apos;utilisation du site pour nous aider à améliorer nos services. Aucune donnée personnelle n&apos;est transmise à des tiers.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Gestion de vos préférences</h2>
            <p>Vous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Chrome : Paramètres → Confidentialité et sécurité → Cookies</li>
              <li>Firefox : Options → Vie privée et sécurité</li>
              <li>Safari : Préférences → Confidentialité</li>
            </ul>
            <p className="text-foreground/50">Notez que désactiver certains cookies peut affecter le fonctionnement du site.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Durée de conservation</h2>
            <p>Les cookies de session expirent à la fermeture de votre navigateur. Les cookies persistants ont une durée maximale de 30 jours.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Contact</h2>
            <p>Pour toute question relative aux cookies, contactez-nous à <a href="mailto:privacy@voyago.tg" className="text-primary hover:underline">privacy@voyago.tg</a></p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 text-sm text-foreground/40 border-t border-border pt-8">
          <Link href="/legal" className="hover:text-primary transition-colors">Mentions légales</Link>
          <Link href="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
        </div>
      </main>
    </div>
  );
}

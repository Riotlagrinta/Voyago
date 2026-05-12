"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ConfidentialitePage() {
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
        <h1 className="text-4xl font-black mb-2 text-foreground tracking-tight">Politique de confidentialité</h1>
        <p className="text-foreground/40 text-sm mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-foreground/70 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Données collectées</h2>
            <p>Lors de votre inscription et utilisation de Voyago, nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nom complet et adresse email</li>
              <li>Numéro de téléphone (pour les paiements mobile money)</li>
              <li>Historique de réservations et voyages</li>
              <li>Données de localisation (si vous activez le suivi GPS)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gérer vos réservations et paiements</li>
              <li>Vous envoyer vos e-tickets et confirmations</li>
              <li>Améliorer nos services et l&apos;expérience utilisateur</li>
              <li>Lutter contre la fraude</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Partage des données</h2>
            <p>Voyago ne revend pas vos données personnelles. Elles peuvent être partagées uniquement avec :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Les compagnies de transport pour l&apos;exécution de votre réservation</li>
              <li>Nos prestataires de paiement (T-Money, Flooz) pour traiter vos transactions</li>
              <li>Les autorités légales en cas d&apos;obligation légale</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Conservation des données</h2>
            <p>Vos données sont conservées pendant la durée de votre compte, et jusqu&apos;à 3 ans après la clôture de celui-ci pour des raisons légales et comptables.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Vos droits</h2>
            <p>Conformément aux lois en vigueur, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
              <li>Droit à la portabilité</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@voyago.tg" className="text-primary hover:underline">privacy@voyago.tg</a></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">Sécurité</h2>
            <p>Nous utilisons des protocoles HTTPS, le chiffrement des mots de passe (bcrypt), et des bases de données sécurisées (Supabase) pour protéger vos informations.</p>
          </section>
        </div>

        <div className="mt-16 flex gap-6 text-sm text-foreground/40 border-t border-border pt-8">
          <Link href="/legal" className="hover:text-primary transition-colors">Mentions légales</Link>
          <Link href="/cookies" className="hover:text-primary transition-colors">Gestion des cookies</Link>
        </div>
      </main>
    </div>
  );
}

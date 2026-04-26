"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Bus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ArrowRight,
  Loader2,
  Calendar,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";

interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  themeColor?: string;
  slogan?: string;
  description?: string;
  certified: boolean;
  phone?: string;
  email?: string;
  address?: string;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  caption?: string;
}

export default function CompanyVitrinePage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await api.get(`/companies/${params.slug}`);
        setCompany(response.data.data.company);
        setGallery(response.data.data.gallery || []);
      } catch (err) {
        console.error("Erreur chargement vitrine", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Compagnie introuvable</h1>
        <Button onClick={() => router.push("/compagnies")}>Retour au catalogue</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Banner Section */}
      <div 
        className="h-80 md:h-[450px] w-full relative overflow-hidden"
        style={{ backgroundColor: company.themeColor || "var(--color-primary-600)" }}
      >
        {company.bannerUrl && (
          <img src={company.bannerUrl} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-6">
            <div className="p-2 bg-white rounded-3xl shadow-2xl">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-surface border border-border flex items-center justify-center font-black text-primary text-4xl overflow-hidden">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  company.name.charAt(0)
                )}
              </div>
            </div>
            <div className="flex-grow text-white pb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">{company.name}</h1>
                {company.certified && <Badge variant="info" className="bg-white/20 text-white border-none backdrop-blur-md">Certifiée</Badge>}
              </div>
              <p className="text-xl opacity-80 italic font-medium">"{company.slogan || "Le confort et la sécurité"}"</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* About & Info */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full" />
              À propos de nous
            </h2>
            <div className="prose prose-slate max-w-none text-foreground/70 leading-relaxed">
              {company.description || "Cette compagnie est l'un de nos partenaires de confiance au Togo. Elle s'engage à fournir un service de qualité, ponctuel et sécurisé à tous ses passagers."}
            </div>
          </section>

          {gallery.length > 0 && (
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full" />
                Notre Flotte en images
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="aspect-video rounded-2xl overflow-hidden border border-border group cursor-pointer">
                    <img 
                      src={img.imageUrl} 
                      alt={img.caption || ""} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-primary mb-2">Prêt à voyager ?</h3>
                <p className="text-foreground/60">Consultez nos prochains départs et réservez votre place.</p>
              </div>
              <Button size="lg" className="rounded-2xl px-8 h-16 text-lg font-bold shadow-xl shadow-primary/20" onClick={() => router.push(`/search?company=${company.id}`)}>
                Voir les trajets <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-8">
          <Card className="p-8 border-none shadow-voyago rounded-3xl sticky top-24">
            <h3 className="font-bold text-lg mb-6">Informations de contact</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/40 uppercase">Adresse</p>
                  <p className="text-sm font-medium">{company.address || "Lomé, Togo"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/40 uppercase">Téléphone</p>
                  <p className="text-sm font-medium">{company.phone || "+228 90 00 00 00"}</p>
                </div>
              </div>

              {company.email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground/40 uppercase">Email</p>
                    <p className="text-sm font-medium">{company.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground/40 uppercase">Horaires</p>
                  <p className="text-sm font-medium">Lundi - Dimanche (05h - 22h)</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-surface space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-success" />
                <span className="text-sm font-medium">Partenaire certifié Voyago</span>
              </div>
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

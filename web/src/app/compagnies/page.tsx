"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bus, 
  ChevronRight, 
  ShieldCheck, 
  MapPin, 
  Phone,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";

interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  themeColor?: string;
  slogan?: string;
  certified: boolean;
  phone?: string;
  address?: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get("/companies");
        setCompanies(response.data.data || []);
      } catch (err) {
        console.error("Erreur chargement compagnies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar Premium */}
      <nav className="fixed top-4 inset-x-4 z-50">
        <div className="max-w-7xl mx-auto bg-surface/80 backdrop-blur-md border border-border shadow-voyago rounded-2xl px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-primary p-1.5 rounded-lg shadow-sm shadow-primary/20">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Voyago</span>
          </div>
          <Button variant="ghost" size="sm" className="font-bold text-foreground/60 hover:text-primary" onClick={() => router.push("/")}>Retour à l'accueil</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Partenaires de confiance</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-foreground">Nos Compagnies <br /><span className="text-primary">Partenaires</span></h1>
          <p className="text-foreground/50 max-w-xl mx-auto font-medium leading-relaxed">
            Nous collaborons avec les meilleures compagnies de transport au Togo
            pour vous garantir un voyage sûr, confortable et ponctuel.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground/30">Analyse du réseau...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <Card
                key={company.id}
                hoverable
                className="p-0 overflow-hidden border border-border/50 shadow-voyago flex flex-col group rounded-[2.5rem]"
                onClick={() => router.push(`/compagnies/${company.slug}`)}
              >
                {/* Banner Placeholder or Image */}
                <div
                  className="h-40 w-full relative transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundColor: company.themeColor || "var(--color-primary-600)" }}
                >
                  {company.bannerUrl && (
                    <img src={company.bannerUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  <div className="absolute -bottom-10 left-8 p-1.5 bg-surface rounded-[1.5rem] shadow-xl border border-border/20">
                    <div className="w-20 h-20 rounded-2xl bg-surface-100 border border-border/50 flex items-center justify-center font-black text-primary text-2xl overflow-hidden shadow-inner">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        company.name.charAt(0)
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-14 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-2xl font-black tracking-tight text-foreground">{company.name}</h3>
                    {company.certified && (
                      <div className="bg-blue-500/10 p-1 rounded-full border border-blue-500/20">
                         <ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground/40 mb-8 italic leading-relaxed">
                    "{company.slogan || "Le confort avant tout"}"
                  </p>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground/60 bg-surface-100 px-4 py-2.5 rounded-xl w-fit">
                      <MapPin className="w-4 h-4 text-primary" />
                      {company.address || "Lomé, Togo"}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground/60 bg-surface-100 px-4 py-2.5 rounded-xl w-fit">
                      <Phone className="w-4 h-4 text-primary" />
                      {company.phone || "+228 90 00 00 00"}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button variant="outline" className="w-full rounded-2xl py-4 h-auto font-black uppercase text-[11px] tracking-[0.1em] border-border/50 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                      Voir la vitrine <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { type ComponentType } from "react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DatePicker } from "@/components/ui/DatePicker";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from "next/dynamic";
const Bus3D = dynamic(() => import("@/components/Bus3D"), { ssr: false });
import ActiveSchedules from "@/components/ActiveSchedules";
import {
  MapPin,
  Search,
  Bus,
  ShieldCheck,
  Clock,
  CreditCard,
  LogOut,
  Zap,
  ChevronRight
} from "lucide-react";

function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: ComponentType<{ className?: string }>, title: string, description: string, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex flex-col items-center text-center p-8 bg-surface-50 rounded-2xl shadow-sm border border-border/50 hover:border-primary/50 transition-all group"
    >
      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold mb-3 text-foreground tracking-tight">{title}</h3>
      <p className="text-foreground/50 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [search, setSearch] = useState({
    departure: "",
    arrival: "",
    date: ""
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.departure) params.append("departure", search.departure);
    if (search.arrival) params.append("arrival", search.arrival);
    if (search.date) params.append("date", search.date);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background text-foreground transition-colors duration-500">
      {/* Navbar Premium */}
      <nav className="fixed top-4 inset-x-4 z-[100]">
        <div className="max-w-6xl mx-auto bg-surface/80 backdrop-blur-md border border-border shadow-voyago rounded-2xl px-6 py-3 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push("/")}>
            <div className="bg-primary p-2 rounded-lg shadow-md shadow-primary/20">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">Voyago</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
            <Link href="/search" className="hover:text-primary transition-colors">Trajets</Link>
            <Link href="/compagnies" className="hover:text-primary transition-colors">Compagnies</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Support</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-foreground/70 hover:text-primary" onClick={() => router.push("/login")}>Connexion</Button>
                <Button size="sm" className="rounded-xl px-5" onClick={() => router.push("/register")}>S'inscrire</Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-foreground/70 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
                  {user?.name}
                </div>
                <Button variant="ghost" size="icon" className="text-rose-500 rounded-lg hover:bg-rose-500/10" onClick={logout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 mb-8">
                  <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Le transport réinventé au Togo</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground">
                  Voyagez <br /><span className="text-primary">sans limites.</span>
                </h1>
                <p className="text-lg text-foreground/80 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">Réservez vos places de bus en toute sécurité avec suivi GPS en temps réel.</p>
                <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
                   <Button size="lg" className="rounded-xl px-8 font-bold shadow-lg shadow-primary/25" onClick={() => router.push("/search")}>Trouver un trajet <ChevronRight className="ml-2 w-4 h-4" /></Button>
                   <Button variant="outline" size="lg" className="rounded-xl px-8 font-bold border-border" onClick={() => router.push("/about")}>En savoir plus</Button>
                </div>
              </motion.div>
              <div className="hidden lg:block h-[450px] relative">
                <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full" />
                <Bus3D />
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-5xl mx-auto mt-20"
            >
              <Card className="p-3 border-none shadow-voyago rounded-2xl bg-surface/90 backdrop-blur-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-3">
                    <Input
                      placeholder="Départ"
                      leftIcon={<MapPin className="text-primary w-5 h-5" />}
                      className="border-none bg-surface-100 rounded-xl h-14 font-semibold"
                      value={search.departure}
                      onChange={(e) => setSearch({ ...search, departure: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input 
                      placeholder="Arrivée"
                      leftIcon={<MapPin className="text-primary w-5 h-5" />}
                      className="border-none bg-surface-100 rounded-xl h-14 font-semibold"
                      value={search.arrival}
                      onChange={(e) => setSearch({ ...search, arrival: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <DatePicker
                      date={search.date}
                      onChange={(date) => setSearch({ ...search, date })}
                      className="border-none bg-surface-100 rounded-xl h-14 font-semibold w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button className="w-full h-14 rounded-xl text-md font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" onClick={handleSearch}>
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Trajets en cours (Géolocalisation) */}
        <ActiveSchedules />

        {/* Features */}
        <section className="py-24 bg-surface-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard icon={ShieldCheck} title="Sécurité" description="Chauffeurs certifiés et bus géolocalisés." />
              <FeatureCard icon={Clock} title="Temps réel" description="Ne ratez plus jamais votre car grâce au suivi GPS." />
              <FeatureCard icon={CreditCard} title="Mobile Money" description="Paiements sécurisés via T-Money ou Flooz." />
            </div>
          </div>
        </section>

        {/* Section Stats */}
        <section className="py-20 bg-surface border-y border-border relative overflow-hidden">
           <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-wrap justify-around gap-12 text-center">
              <div className="flex flex-col gap-2">
                 <p className="text-5xl font-extrabold text-primary">50K+</p>
                 <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Passagers satisfaits</p>
              </div>
              <div className="flex flex-col gap-2">
                 <p className="text-5xl font-extrabold text-primary">120</p>
                 <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Bus en service</p>
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-surface border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm shadow-primary/20"><Bus className="text-white w-4 h-4" /></div>
            <span className="text-lg font-bold text-foreground tracking-tight">Voyago</span>
          </div>
          <div className="flex gap-8 mb-8 text-sm font-semibold text-foreground/40">
            <Link href="/legal" className="hover:text-primary transition-colors">Légal</Link>
            <Link href="/confidentialite" className="hover:text-primary transition-colors">Vie privée</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
          <p className="text-foreground/30 font-medium text-xs">© {new Date().getFullYear()} Voyago Togo. Propulsé par la tech.</p>
        </div>
      </footer>
    </div>
  );
}

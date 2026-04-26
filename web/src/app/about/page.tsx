"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Bus, 
  ShieldCheck, 
  Zap, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  MapPin, 
  Heart,
  TrendingUp,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Simple */}
      <nav className="glass sticky top-0 z-[60] border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Bus className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-primary">Voyago</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="font-bold">
            Retour à l'accueil
          </Button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
          </div>
          
          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="info" className="mb-6 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest bg-primary/20 text-primary border-none">
                Notre Vision
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">
                Redéfinir le voyage <br />
                <span className="text-primary">routier au Togo.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
                Voyago est né d'une ambition simple : digitaliser le transport routier pour offrir 
                à chaque citoyen une expérience de voyage fluide, sécurisée et moderne.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Impact */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pourquoi Voyago ?</h2>
                  <p className="text-lg text-slate-600 font-medium">
                    Pendant trop longtemps, réserver une place de bus au Togo signifiait se déplacer 
                    des heures à l'avance, faire la queue sans garantie de siège, et gérer des paiements complexes.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: Zap, title: "Zéro attente", desc: "Réservez en 30 secondes depuis votre canapé." },
                    { icon: ShieldCheck, title: "Sécurité totale", desc: "Paiements vérifiés et suivi GPS en temps réel." },
                    { icon: Smartphone, title: "100% Mobile", desc: "Votre ticket est dans votre poche, scannable partout." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white shadow-sm border border-border">
                      <div className="bg-primary/10 p-3 rounded-xl h-fit">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="relative">
                <div className="aspect-square bg-primary/5 rounded-[3rem] overflow-hidden relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Bus className="w-64 h-64 text-primary/10" />
                   </div>
                   <motion.div 
                     animate={{ y: [0, -20, 0] }}
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-border w-64"
                   >
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <Badge variant="success" className="font-black">PAYÉ</Badge>
                            <span className="text-[10px] font-black text-slate-400 italic">Voyago Pay</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: "100%" }}
                              transition={{ duration: 1.5 }}
                              className="h-full bg-primary" 
                            />
                         </div>
                         <p className="text-xs font-black text-slate-900">Lomé → Kara</p>
                         <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Siège #12</span>
                            <span>8,500 F</span>
                         </div>
                      </div>
                   </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="py-24 bg-white border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Villes desservies", value: "15+" },
                { label: "Bus Modernes", value: "25" },
                { label: "Voyageurs", value: "12k+" },
                { label: "Satisfaction", value: "99%" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-4xl md:text-5xl font-black text-primary mb-2 tracking-tighter">{stat.value}</p>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative text-center">
           <div className="max-w-3xl mx-auto px-6 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Prêt pour votre prochain voyage ?</h2>
              <p className="text-lg text-slate-400 font-medium mb-12">
                 Rejoignez les milliers de Togolais qui font confiance à Voyago pour leurs déplacements 
                 quotidiens. Confort, ponctualité et sécurité garantie.
              </p>
              <Button 
                size="lg" 
                className="rounded-2xl h-16 px-12 text-xl font-black shadow-xl shadow-primary/20"
                onClick={() => router.push("/")}
              >
                Réserver ma place maintenant
              </Button>
           </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="py-12 bg-white text-center border-t border-border">
         <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1 rounded-lg"><Bus className="text-white w-4 h-4" /></div>
              <span className="font-black text-primary text-xl tracking-tight">Voyago</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Digitalisation du transport routier au Togo. Fait avec ❤️ à Lomé.</p>
         </div>
      </footer>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Minus, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  Bus,
  ChevronLeft,
  Search,
  HelpCircle,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const faqs = [
  {
    q: "Comment réserver un billet sur Voyago ?",
    a: "C'est très simple ! Sur la page d'accueil, indiquez votre ville de départ, votre destination et la date souhaitée. Choisissez ensuite le trajet qui vous convient, sélectionnez votre siège et payez par T-Money ou Flooz."
  },
  {
    q: "Quels sont les modes de paiement acceptés ?",
    a: "Nous acceptons actuellement les paiements mobiles locaux Togocom (T-Money) et Moov Africa (Flooz). Le paiement est instantané et sécurisé."
  },
  {
    q: "Dois-je imprimer mon ticket ?",
    a: "Pas nécessairement. Vous recevez un ticket digital avec un QR Code unique. Vous pouvez simplement le présenter sur votre smartphone au chauffeur lors de l'embarquement."
  },
  {
    q: "Puis-je annuler ma réservation ?",
    a: "Oui, vous pouvez annuler votre réservation jusqu'à 24h avant le départ depuis votre espace 'Mes Voyages'. Les frais d'annulation sont détaillés dans nos conditions générales."
  }
];

export default function ContactPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Votre message a été envoyé ! Nous vous répondrons sous 24h.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <Bus className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-primary tracking-tight">Voyago</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="font-bold">
            <ChevronLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16 space-y-4">
           <HelpCircle className="w-16 h-16 text-primary mx-auto opacity-20" />
           <h1 className="text-5xl font-black text-slate-900 tracking-tight text-center">Comment pouvons-nous <br /> <span className="text-primary text-center">vous aider ?</span></h1>
           <p className="text-slate-500 font-medium max-w-xl mx-auto">Trouvez des réponses rapides dans notre FAQ ou contactez notre équipe support disponible 7j/7.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* FAQ Section */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <MessageSquare className="text-primary w-6 h-6" /> Questions Fréquentes
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-border overflow-hidden transition-all shadow-sm hover:shadow-md">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-6 text-left flex items-center justify-between group"
                  >
                    <span className="font-black text-slate-800 pr-8">{faq.q}</span>
                    <div className={cn("p-2 rounded-xl transition-all", openFaq === i ? "bg-primary text-white" : "bg-surface text-slate-400 group-hover:bg-primary/10 group-hover:text-primary")}>
                      {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-slate-500 font-medium leading-relaxed border-t border-surface pt-4">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
               <div className="bg-primary/20 p-4 rounded-3xl">
                  <Clock className="w-10 h-10 text-primary" />
               </div>
               <div>
                  <h4 className="font-black text-lg">Support Client Réactif</h4>
                  <p className="text-slate-400 text-sm">Notre équipe est disponible de 06h à 22h pour vous assister dans vos réservations.</p>
               </div>
               <Button className="md:ml-auto rounded-2xl h-14 px-8 font-black whitespace-nowrap">Appeler le 90 00 00 00</Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-5">
            <Card className="p-10 border-none shadow-voyago rounded-[2.5rem] bg-white sticky top-24">
              <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Écrivez-nous</h2>
              <p className="text-slate-400 text-sm text-center mb-8">Une suggestion ou une réclamation ?</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Votre Nom" placeholder="Nom complet" required />
                <Input label="Email" type="email" placeholder="votre@email.com" required />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Votre Message</label>
                  <textarea 
                    className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[150px] transition-all"
                    placeholder="Dites-nous tout..."
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                  isLoading={loading}
                  rightIcon={<Send className="w-5 h-5" />}
                >
                  Envoyer mon message
                </Button>
              </form>

              <div className="mt-10 pt-10 border-t border-surface grid grid-cols-2 gap-4">
                 <div className="text-center space-y-1">
                    <Phone className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase">Téléphone</p>
                    <p className="text-xs font-bold">+228 90 00 00 00</p>
                 </div>
                 <div className="text-center space-y-1">
                    <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase">Email Support</p>
                    <p className="text-xs font-bold">hello@voyago.tg</p>
                 </div>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

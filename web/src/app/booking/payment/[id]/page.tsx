"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Bus,
  CheckCircle2,
  Wallet
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [method, setMethod] = useState<"tmoney" | "flooz">("tmoney");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${params.id}`);
        setBooking(response.data.data);
        if (response.data.data.passengerPhone) {
          setPhoneNumber(response.data.data.passengerPhone);
        }
      } catch (err) {
        setError("Impossible de récupérer les détails de la réservation.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [params.id]);

  const handlePayment = async () => {
    if (!phoneNumber) {
      setError("Veuillez saisir votre numéro de téléphone.");
      return;
    }

    setPayLoading(true);
    setError(null);

    try {
      // Appel au backend (qui utilise le MockProvider)
      const response = await api.post("/payments/process", {
        bookingId: params.id,
        method: method,
        phoneNumber: phoneNumber
      });

      if (response.data.success) {
        // Redirection vers la page de confirmation
        router.push(`/booking/confirmation/${params.id}`);
      } else {
        setError(response.data.message || "Le paiement a échoué.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du traitement du paiement.");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!booking) return <div className="p-20 text-center text-foreground/40 font-bold">Réservation introuvable</div>;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground/60 hover:text-primary font-medium transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          <h1 className="text-lg font-black tracking-tight">Paiement Sécurisé</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black mb-2">Choisir un mode de paiement</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* T-Money Option */}
              <div 
                onClick={() => setMethod("tmoney")}
                className={cn(
                  "p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  method === "tmoney" ? "border-primary bg-white shadow-xl shadow-primary/5" : "border-transparent bg-white/50 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    method === "tmoney" ? "bg-primary text-white" : "bg-surface text-foreground/40"
                  )}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">T-Money</p>
                    <p className="text-xs text-foreground/40">Paiement via Togocom</p>
                  </div>
                </div>
                {method === "tmoney" && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>

              {/* Flooz Option */}
              <div 
                onClick={() => setMethod("flooz")}
                className={cn(
                  "p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  method === "flooz" ? "border-primary bg-white shadow-xl shadow-primary/5" : "border-transparent bg-white/50 hover:bg-white"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    method === "flooz" ? "bg-primary text-white" : "bg-surface text-foreground/40"
                  )}>
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Flooz</p>
                    <p className="text-xs text-foreground/40">Paiement via Moov Africa</p>
                  </div>
                </div>
                {method === "flooz" && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Input Phone */}
            <Card className="p-8 border-none shadow-voyago rounded-[2.5rem] bg-white">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Numéro de téléphone</h3>
              </div>
              <p className="text-sm text-foreground/40 mb-6 italic">
                Saisissez le numéro qui sera débité pour cette transaction.
              </p>
              <div className="max-w-md">
                <Input 
                  label="Numéro Mobile Money" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="Ex: 90123456"
                  className="h-14 text-lg font-bold tracking-widest"
                />
              </div>
            </Card>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-foreground/30 py-4">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Transactions sécurisées par cryptage SSL</span>
            </div>
          </div>

          {/* Sidebar Recap */}
          <aside className="space-y-6">
            <Card className="p-6 border-none shadow-voyago rounded-[2.5rem] bg-white sticky top-24">
              <h3 className="font-bold mb-6 text-xs uppercase text-foreground/40 tracking-wider">Résumé de la commande</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{booking.schedule.route.company?.name || "Voyago"}</p>
                    <p className="text-[10px] text-foreground/40 font-medium">{booking.schedule.route.departureStation.city} → {booking.schedule.route.arrivalStation.city}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-surface">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/40">Billet (1x)</span>
                    <span className="font-bold">{parseInt(booking.totalPrice).toLocaleString()} F</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/40">Frais de service</span>
                    <span className="text-success font-bold">Gratuit</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface flex justify-between items-end">
                  <span className="font-black text-sm uppercase">À payer</span>
                  <span className="text-3xl font-black text-primary leading-none">
                    {parseInt(booking.totalPrice).toLocaleString()} <span className="text-sm">F</span>
                  </span>
                </div>
              </div>

              <Button 
                className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20" 
                isLoading={payLoading} 
                onClick={handlePayment}
                leftIcon={<CreditCard className="w-5 h-5" />}
              >
                Payer maintenant
              </Button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
            </Card>
          </aside>

        </div>
      </main>
    </div>
  );
}

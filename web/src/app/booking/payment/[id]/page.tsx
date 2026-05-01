"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Smartphone, ShieldCheck, Loader2, AlertCircle,
  Bus, CheckCircle2, Wallet, CreditCard,
} from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  seatNumber: number;
  status: string;
  totalPrice: string;
  passengerName: string | null;
  passengerPhone: string | null;
  schedule: {
    departureTime: string;
    route: {
      departureStation: { city: string };
      arrivalStation: { city: string };
      company: { name: string };
    };
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [method, setMethod] = useState<"tmoney" | "flooz">("tmoney");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/bookings/${params.id}`)
      .then(r => {
        const b: Booking = r.data.data;
        setBooking(b);
        if (b.passengerPhone) setPhoneNumber(b.passengerPhone);
      })
      .catch(() => setError("Impossible de récupérer la réservation."))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePayment = async () => {
    if (!phoneNumber.trim()) { setError("Saisissez votre numéro de téléphone."); return; }
    setPayLoading(true);
    setError(null);
    try {
      await api.post("/payments/process", {
        bookingId: params.id,
        method,
        phoneNumber,
      });
      router.push(`/booking/confirmation/${params.id}`);
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Le paiement a échoué. Réessayez.");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center space-y-4">
        <p className="text-foreground/40 font-bold">{error || "Réservation introuvable."}</p>
        <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
      </div>
    </div>
  );

  const amount = parseInt(booking.totalPrice);

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-foreground/60 hover:text-primary font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          <h1 className="text-lg font-black tracking-tight">Paiement sécurisé</h1>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black">Choisir un mode de paiement</h2>

            <div className="grid grid-cols-2 gap-4">
              {([
                { id: "tmoney", label: "T-Money", sub: "Paiement via Togocom", icon: Smartphone },
                { id: "flooz",  label: "Flooz",   sub: "Paiement via Moov Africa", icon: Wallet },
              ] as const).map(({ id, label, sub, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMethod(id)}
                  className={cn(
                    "p-6 rounded-3xl border-2 text-left transition-all duration-200 relative",
                    method === id
                      ? "border-primary bg-white shadow-xl shadow-primary/5"
                      : "border-transparent bg-white/60 hover:bg-white hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      method === id ? "bg-primary text-white" : "bg-surface-100 text-foreground/30"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{label}</p>
                      <p className="text-xs text-foreground/40">{sub}</p>
                    </div>
                  </div>
                  {method === id && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <Card className="p-8 border-none shadow-voyago rounded-3xl bg-white">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Numéro à débiter</h3>
              </div>
              <p className="text-sm text-foreground/40 mb-6">
                Saisissez le numéro {method === "tmoney" ? "T-Money" : "Flooz"} qui sera débité.
              </p>
              <div className="max-w-sm">
                <Input
                  label="Numéro Mobile Money"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: 90123456"
                  className="h-14 text-lg font-bold tracking-widest"
                />
              </div>
            </Card>

            <div className="flex items-center justify-center gap-2 text-foreground/30 py-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Transactions sécurisées SSL</span>
            </div>
          </div>

          {/* Sidebar récap */}
          <aside>
            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white sticky top-24 space-y-6">
              <h3 className="font-black text-xs uppercase text-foreground/40 tracking-widest">Résumé</h3>

              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{booking.schedule.route.company.name}</p>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    {booking.schedule.route.departureStation.city} → {booking.schedule.route.arrivalStation.city}
                  </p>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    Siège #{booking.seatNumber} · {new Date(booking.schedule.departureTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/50">Billet (×1)</span>
                  <span className="font-bold">{amount.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Frais de service</span>
                  <span className="font-bold text-success">Gratuit</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-border">
                <span className="font-black text-sm uppercase">À payer</span>
                <span className="text-3xl font-black text-primary">{amount.toLocaleString()} <span className="text-sm">F</span></span>
              </div>

              <Button
                className="w-full h-16 rounded-2xl text-base font-black shadow-xl shadow-primary/20"
                isLoading={payLoading}
                onClick={handlePayment}
                leftIcon={<CreditCard className="w-5 h-5" />}
              >
                Payer {amount.toLocaleString()} F
              </Button>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs flex items-center gap-2 border border-red-100">
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

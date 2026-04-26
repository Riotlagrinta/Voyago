"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Bus, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  User as UserIcon,
  Download,
  ArrowRight,
  Loader2,
  Share2
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import Ticket3D from "@/components/Ticket3D";

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${params.id}`);
        setBooking(response.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [params.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!booking) return <div className="p-20 text-center text-foreground/40 font-bold">Réservation introuvable</div>;

  const departureTime = new Date(booking.schedule.departureTime);
  const dateStr = departureTime.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-surface py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête de succès */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-1">Paiement Réussi !</h1>
          <p className="text-foreground/40 font-medium">Votre voyage est prêt. Voici votre ticket interactif.</p>
        </div>

        {/* Section 3D Wow Effect */}
        <div className="mb-12 relative h-[420px]">
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-3xl -z-10" />
          <Ticket3D 
            passengerName={booking.passengerName || "Passager"} 
            seatNumber={booking.seatNumber.toString()} 
            from={booking.schedule.route.departureStation.city} 
            to={booking.schedule.route.arrivalStation.city} 
            date={dateStr}
          />
          <p className="text-center text-[10px] text-foreground/20 font-bold uppercase tracking-widest mt-2">
            Astuce : Faites pivoter le ticket avec votre souris
          </p>
        </div>

        {/* Détails du Ticket Classique */}
        <Card className="p-0 border-none shadow-voyago rounded-[2.5rem] overflow-hidden mb-12">
          <div className="bg-primary p-10 text-white flex flex-col md:flex-row justify-between gap-6 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <div className="space-y-2 relative">
              <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Compagnie de transport</p>
              <h2 className="text-4xl font-black">{booking.schedule.route.company?.name || "Voyago Partner"}</h2>
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Certifié Voyago</Badge>
            </div>
            
            <div className="text-right flex flex-col items-end justify-center relative">
              <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Siège</p>
                <span className="text-4xl font-black">#{booking.seatNumber}</span>
              </div>
            </div>
          </div>

          <div className="p-10 space-y-10 bg-white relative">
            <div className="absolute top-0 -left-4 w-8 h-8 bg-surface rounded-full -translate-y-1/2" />
            <div className="absolute top-0 -right-4 w-8 h-8 bg-surface rounded-full -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Date & Heure de départ</p>
                    <p className="text-lg font-bold">{dateStr}</p>
                    <p className="text-2xl font-black text-primary">{departureTime.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Itinéraire du voyage</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{booking.schedule.route.departureStation.city}</span>
                      <ArrowRight className="w-4 h-4 text-foreground/20" />
                      <span className="text-lg font-bold">{booking.schedule.route.arrivalStation.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Détails Passager</p>
                    <p className="text-lg font-bold">{booking.passengerName}</p>
                    <p className="text-xs text-foreground/40 font-medium">{booking.passengerPhone}</p>
                  </div>
                </div>

                <div className="bg-surface/50 p-6 rounded-3xl flex items-center justify-between border border-border border-dashed">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">ID Réservation</p>
                    <p className="text-sm font-mono font-bold tracking-widest text-primary">{booking.id.split('-')[0].toUpperCase()}</p>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm p-2">
                    {booking.qrCode ? (
                      <QRCodeCanvas 
                        value={booking.qrCode} 
                        size={64}
                        level="H"
                        includeMargin={false}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-black rounded-[4px]" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-surface flex flex-col md:flex-row gap-6 items-center justify-between bg-surface/20">
            <div className="flex items-center gap-3 text-xs text-foreground/40 font-bold uppercase tracking-widest">
              <Bus className="w-4 h-4" /> Présentez-vous 30min avant
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-12" leftIcon={<Download className="w-4 h-4" />}>
                PDF
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-12" leftIcon={<Share2 className="w-4 h-4" />}>
                Partager
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button className="rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-primary/20" onClick={() => router.push("/")}>
            Retour à l'accueil
          </Button>
          <Button variant="ghost" className="rounded-2xl h-16 px-10 text-lg font-bold" onClick={() => router.push("/bookings")}>
            Mes réservations
          </Button>
        </div>
      </div>
    </div>
  );
}

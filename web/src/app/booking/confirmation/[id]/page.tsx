"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bus, CheckCircle2, Calendar, MapPin, User as UserIcon,
  Download, ArrowRight, Loader2, Share2, Hash,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import Ticket3D from "@/components/Ticket3D";

interface Booking {
  id: string;
  seatNumber: number;
  status: string;
  totalPrice: string;
  passengerName: string | null;
  passengerPhone: string | null;
  qrCode: string | null;
  schedule: {
    departureTime: string;
    route: {
      departureStation: { name: string; city: string };
      arrivalStation: { name: string; city: string };
      company: { name: string };
    };
    bus: { plateNumber: string };
  };
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  pending:   "En attente de paiement",
  completed: "Voyage terminé",
  cancelled: "Annulé",
};

export default function ConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${params.id}`)
      .then(r => setBooking(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/bookings/${params.id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-voyago-${String(params.id).split("-")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors du téléchargement du PDF.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "Mon ticket Voyago", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papier !");
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
        <p className="text-foreground/40 font-bold text-lg">Réservation introuvable</p>
        <Button onClick={() => router.push("/")}>Retour à l'accueil</Button>
      </div>
    </div>
  );

  const departureTime = new Date(booking.schedule.departureTime);
  const dateStr = departureTime.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = departureTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const isConfirmed = booking.status === "confirmed" || booking.status === "completed";

  return (
    <div className="min-h-screen bg-surface py-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* En-tête */}
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isConfirmed ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          }`}>
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-1">
            {isConfirmed ? "Réservation confirmée !" : "Réservation enregistrée"}
          </h1>
          <p className="text-foreground/40 font-medium">
            {isConfirmed
              ? "Votre billet est prêt. Présentez le QR code au chauffeur."
              : "En attente de confirmation du paiement."}
          </p>
        </div>

        {/* Ticket 3D */}
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
            Faites pivoter avec votre souris
          </p>
        </div>

        {/* Carte ticket */}
        <Card className="p-0 border-none shadow-voyago rounded-[2.5rem] overflow-hidden mb-8">
          {/* Header coloré */}
          <div className="bg-primary p-10 text-white relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em]">Compagnie</p>
                <h2 className="text-3xl font-black">{booking.schedule.route.company.name}</h2>
                <Badge className="bg-white/20 text-white border-none">Certifié Voyago</Badge>
              </div>
              <div className="bg-white/20 px-8 py-4 rounded-3xl backdrop-blur-md border border-white/10 text-center">
                <p className="text-[10px] font-black uppercase opacity-60 mb-1">Siège</p>
                <span className="text-4xl font-black">#{booking.seatNumber}</span>
              </div>
            </div>
          </div>

          {/* Corps du ticket */}
          <div className="p-10 bg-white relative space-y-8">
            {/* Encoches décoratives */}
            <div className="absolute top-0 -left-4 w-8 h-8 bg-surface rounded-full -translate-y-1/2" />
            <div className="absolute top-0 -right-4 w-8 h-8 bg-surface rounded-full -translate-y-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Date & heure de départ</p>
                    <p className="text-lg font-bold">{dateStr}</p>
                    <p className="text-2xl font-black text-primary">{timeStr}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Itinéraire</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{booking.schedule.route.departureStation.city}</span>
                      <ArrowRight className="w-4 h-4 text-foreground/20" />
                      <span className="text-lg font-bold">{booking.schedule.route.arrivalStation.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Passager</p>
                    <p className="text-lg font-bold">{booking.passengerName || "—"}</p>
                    <p className="text-sm text-foreground/40">{booking.passengerPhone || "—"}</p>
                  </div>
                </div>

                {/* QR Code + ID */}
                <div className="bg-surface-100 p-5 rounded-3xl flex items-center justify-between border border-border/50">
                  <div>
                    <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest mb-1">Référence</p>
                    <p className="text-sm font-mono font-black text-primary tracking-widest">
                      {booking.id.split("-")[0].toUpperCase()}
                    </p>
                    <Badge
                      variant={isConfirmed ? "success" : "warning"}
                      className="mt-2 text-[10px]"
                    >
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </Badge>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm p-2">
                    {booking.qrCode ? (
                      <QRCodeCanvas value={booking.qrCode} size={64} level="H" includeMargin={false} />
                    ) : (
                      <div className="w-12 h-12 bg-foreground/5 rounded flex items-center justify-center">
                        <Hash className="w-6 h-6 text-foreground/20" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-8 border-t border-surface/60 bg-surface/20 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-foreground/40 font-bold uppercase tracking-widest">
              <Bus className="w-4 h-4" /> Présentez-vous 30 min avant le départ
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="rounded-2xl h-12"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownloadPDF}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl h-12"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={handleShare}
              >
                Partager
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20"
            onClick={() => router.push("/")}
          >
            Retour à l'accueil
          </Button>
          <Button
            variant="ghost"
            className="rounded-2xl h-14 px-10 font-bold"
            onClick={() => router.push("/bookings")}
          >
            Mes réservations
          </Button>
        </div>
      </div>
    </div>
  );
}

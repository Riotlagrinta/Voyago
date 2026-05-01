"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus, Calendar, MapPin, ChevronRight, Clock,
  Ticket, Loader2, ArrowRight, Search,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface Booking {
  id: string;
  seatNumber: number;
  status: string;
  totalPrice: string;
  createdAt: string;
  schedule: {
    departureTime: string;
    route: {
      departureStation: { name: string; city: string };
      arrivalStation: { name: string; city: string };
      company: { name: string };
    };
  };
}

const STATUS_BADGE: Record<string, "success" | "warning" | "error" | "default"> = {
  confirmed: "success",
  pending:   "warning",
  cancelled: "error",
  completed: "default",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  pending:   "En attente",
  cancelled: "Annulé",
  completed: "Terminé",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/bookings");
      return;
    }
    api.get("/bookings")
      .then(r => setBookings(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.schedule.departureTime) >= now);
  const pastBookings     = bookings.filter(b => new Date(b.schedule.departureTime) < now);
  const displayed = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <nav className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">Voyago</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Retour à l'accueil</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Badge variant="info" className="mb-3">Espace Passager</Badge>
            <h1 className="text-4xl font-black tracking-tight">Mes Réservations</h1>
            <p className="text-foreground/40 font-medium mt-1">
              {bookings.length} réservation{bookings.length > 1 ? "s" : ""} au total
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-border shadow-sm">
            {(["upcoming", "past"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-foreground/40 hover:text-primary"
                )}
              >
                {tab === "upcoming"
                  ? `À venir (${upcomingBookings.length})`
                  : `Passés (${pastBookings.length})`}
              </button>
            ))}
          </div>
        </div>

        {displayed.length > 0 ? (
          <div className="grid gap-4">
            {displayed.map((booking) => {
              const dept = new Date(booking.schedule.departureTime);
              return (
                <Card
                  key={booking.id}
                  hoverable
                  className="p-0 overflow-hidden border-none shadow-voyago group cursor-pointer"
                  onClick={() => router.push(`/booking/confirmation/${booking.id}`)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Bloc date */}
                    <div className="md:w-36 bg-surface border-b md:border-b-0 md:border-r border-border p-6 flex flex-col items-center justify-center text-center shrink-0">
                      <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Départ</p>
                      <p className="text-4xl font-black text-primary leading-none">{dept.getDate()}</p>
                      <p className="text-xs font-bold text-foreground/60 uppercase mt-1">
                        {dept.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs font-black text-foreground/40 bg-white px-2.5 py-1 rounded-full border border-border">
                        <Clock className="w-3 h-3" />
                        {dept.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    {/* Bloc info */}
                    <div className="flex-grow p-7">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-xl">
                            {booking.schedule.route.departureStation.city}
                          </span>
                          <ArrowRight className="w-4 h-4 text-primary/40" />
                          <span className="font-black text-xl">
                            {booking.schedule.route.arrivalStation.city}
                          </span>
                        </div>
                        <Badge variant={STATUS_BADGE[booking.status] ?? "default"}>
                          {STATUS_LABELS[booking.status] ?? booking.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-5 text-sm text-foreground/40 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-primary/40" />
                          Siège <span className="text-foreground font-bold ml-1">#{booking.seatNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-primary/40" />
                          {booking.schedule.route.company.name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary/40" />
                          Réf: <span className="text-foreground font-bold font-mono ml-1">
                            {booking.id.split("-")[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-auto font-black text-primary">
                          {parseInt(booking.totalPrice).toLocaleString()} F
                        </span>
                      </div>
                    </div>

                    {/* Flèche */}
                    <div className="px-6 flex items-center justify-center md:border-l border-border border-dashed">
                      <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-border">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-foreground/20" />
            </div>
            <h3 className="text-2xl font-black mb-2">Aucun voyage trouvé</h3>
            <p className="text-foreground/40 max-w-xs mx-auto mb-8">
              {activeTab === "upcoming"
                ? "Vous n'avez pas de voyage à venir."
                : "Vous n'avez pas encore de voyage passé."}
            </p>
            <Button
              className="rounded-2xl h-14 px-8 font-bold"
              leftIcon={<Search className="w-5 h-5" />}
              onClick={() => router.push("/search")}
            >
              Rechercher un trajet
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

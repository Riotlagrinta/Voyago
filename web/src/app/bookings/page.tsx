"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bus, 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Clock, 
  Ticket, 
  Loader2,
  AlertCircle,
  ArrowRight,
  Search
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
  totalPrice: number;
  createdAt: string;
  schedule: {
    departureTime: string;
    route: {
      departureStation: string;
      arrivalStation: string;
    };
  };
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/bookings");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data.data || []);
      } catch (err) {
        console.error("Erreur chargement réservations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated, router]);

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.schedule.departureTime) >= now);
  const pastBookings = bookings.filter(b => new Date(b.schedule.departureTime) < now);

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar Simple */}
      <nav className="glass sticky top-0 z-50 border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">Voyago</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>Retour à l'accueil</Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Badge variant="info" className="mb-4">Espace Passager</Badge>
            <h1 className="text-4xl font-black tracking-tight">Mes Réservations</h1>
            <p className="text-foreground/40 font-medium mt-2">Retrouvez ici tous vos billets et votre historique de voyage.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-border shadow-sm">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === "upcoming" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-primary"
              )}
            >
              À venir ({upcomingBookings.length})
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === "past" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-primary"
              )}
            >
              Passés ({pastBookings.length})
            </button>
          </div>
        </div>

        {displayBookings.length > 0 ? (
          <div className="grid gap-6">
            {displayBookings.map((booking) => (
              <Card 
                key={booking.id} 
                hoverable 
                className="p-0 overflow-hidden border-none shadow-voyago group"
                onClick={() => router.push(`/booking/confirmation/${booking.id}`)}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Date Block */}
                  <div className="md:w-40 bg-surface border-b md:border-b-0 md:border-r border-border p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black uppercase text-foreground/30 mb-1 tracking-widest">Départ</p>
                    <p className="text-3xl font-black text-primary">
                      {new Date(booking.schedule.departureTime).getDate()}
                    </p>
                    <p className="text-xs font-bold text-foreground/60 uppercase">
                      {new Date(booking.schedule.departureTime).toLocaleDateString("fr-FR", { month: 'short', year: 'numeric' })}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-foreground/40 bg-white px-3 py-1 rounded-full border border-border">
                      <Clock className="w-3 h-3" />
                      {new Date(booking.schedule.departureTime).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Info Block */}
                  <div className="flex-grow p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-xl">{booking.schedule.route.departureStation}</span>
                        <ArrowRight className="w-5 h-5 text-primary/30" />
                        <span className="font-black text-xl">{booking.schedule.route.arrivalStation}</span>
                      </div>
                      <Badge variant={booking.status === "confirmed" ? "success" : "warning"}>
                        {booking.status === "confirmed" ? "Confirmé" : "En attente"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm font-medium text-foreground/40">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary/40" />
                        <span>Siège <span className="text-foreground font-bold">#{booking.seatNumber}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary/40" />
                        <span>Référence: <span className="text-foreground font-bold font-mono">{booking.id.split('-')[0].toUpperCase()}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Action Block */}
                  <div className="p-8 flex items-center justify-center md:border-l border-border border-dashed">
                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-border group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-border">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-foreground/20" />
            </div>
            <h3 className="text-2xl font-black mb-2">Aucun voyage trouvé</h3>
            <p className="text-foreground/40 max-w-xs mx-auto mb-8">Vous n'avez pas encore de réservations dans cette catégorie.</p>
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

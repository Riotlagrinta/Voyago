"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Bus, 
  ChevronLeft, 
  User as UserIcon, 
  Phone, 
  AlertCircle,
  Loader2,
  Lock,
  Armchair,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface Seat {
  id: string;
  seatNumber: number;
  type: string;
  status: "available" | "occupied" | "locked";
}

interface Schedule {
  id: string;
  departure: string;
  price: string;
  route: {
    departureStation: { name: string; city: string };
    arrivalStation: { name: string; city: string };
  };
  bus: {
    plateNumber: string;
  };
  company: {
    name: string;
  };
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1); // 1: Seat, 2: Info (Paiement supprimé)
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<Array<{ name: string; phone: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedRes, seatsRes] = await Promise.all([
          api.get(`/schedules/${params.scheduleId}`),
          api.get(`/schedules/${params.scheduleId}/seats`)
        ]);
        setSchedule(schedRes.data.data);
        setSeats(seatsRes.data.data || []);
      } catch (err) {
        setError("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.scheduleId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "available") return;
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 5) {
        setError("Max 5 sièges.");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleNextStep = () => {
    if (selectedSeats.length === 0) return;
    const initialPassengers = selectedSeats.map((_, index) => ({
      name: index === 0 ? (user?.name || "") : "",
      phone: index === 0 ? (user?.phone || "") : ""
    }));
    setPassengers(initialPassengers);
    setStep(2);
  };

  const updatePassenger = (index: number, field: "name" | "phone", value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleFinalBooking = async () => {
    const allFilled = passengers.every(p => p.name && p.phone);
    if (!allFilled) {
      setError("Remplissez tous les noms.");
      return;
    }

    setBookingLoading(true);
    setError(null);
    try {
      const seatsPayload = selectedSeats.map((seat, index) => ({
        seatId: seat.id,
        passengerName: passengers[index].name,
        passengerPhone: passengers[index].phone
      }));

      const response = await api.post("/bookings", {
        scheduleId: schedule?.id,
        seats: seatsPayload
      });
      
      const bookings = response.data.data;
      if (bookings && bookings.length > 0) {
        router.push(`/booking/payment/${bookings[0].id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la réservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  if (!schedule) return <div className="p-20 text-center">Trajet introuvable</div>;

  const totalPrice = parseInt(schedule.price) * selectedSeats.length;

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground/60 hover:text-primary font-medium transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          
          <div className="flex items-center gap-12">
            {[
              { n: 1, l: "Sièges" },
              { n: 2, l: "Infos" },
              { n: 3, l: "Paiement" }
            ].map((s) => (
              <div key={s.n} className={cn(
                "flex items-center gap-2 text-sm font-bold transition-colors",
                step >= s.n ? "text-primary" : "text-foreground/20"
              )}>
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px]",
                  step >= s.n ? "bg-primary text-white" : "bg-surface border border-border"
                )}>{s.n}</span>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
          <div className="w-20" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card className="p-8 border-none shadow-voyago rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black">Choisissez vos sièges</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                    {selectedSeats.length} sélectionné(s)
                  </Badge>
                </div>
                <div className="bg-surface rounded-3xl p-8 max-w-xs mx-auto border border-border relative">
                  <div className="grid grid-cols-4 gap-4 justify-items-center">
                    {seats.map((seat) => (
                      <div 
                        key={seat.id}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 text-xs font-bold border-2",
                          seat.status === "occupied" ? "bg-border/20 border-transparent text-foreground/20 cursor-not-allowed" :
                          selectedSeats.find(s => s.id === seat.id) ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-110" :
                          "bg-white border-border hover:border-primary/40 text-foreground/60"
                        )}
                        onClick={() => handleSeatClick(seat)}
                      >
                        {seat.status === "occupied" ? <Lock className="w-3 h-3" /> : seat.seatNumber}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-black mb-2">Informations des passagers</h2>
                {selectedSeats.map((seat, index) => (
                  <Card key={seat.id} className="p-8 border-none shadow-voyago rounded-3xl space-y-6">
                    <h3 className="font-bold">Passager #{index + 1} (Siège {seat.seatNumber})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input label="Nom complet" value={passengers[index]?.name || ""} onChange={(e) => updatePassenger(index, "name", e.target.value)} placeholder="Ex: Koffi Mensah" />
                      <Input label="Téléphone" value={passengers[index]?.phone || ""} onChange={(e) => updatePassenger(index, "phone", e.target.value)} placeholder="Ex: 90123456" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white sticky top-24">
              <h3 className="font-bold mb-6 text-sm uppercase text-foreground/40 tracking-wider">Récapitulatif</h3>
              <div className="space-y-6 mb-8 text-sm">
                <div className="flex gap-4">
                  <Bus className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-bold">{schedule.company.name}</p>
                    <p className="text-foreground/40">{schedule.route.departureStation.city} → {schedule.route.arrivalStation.city}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-2xl text-primary">{totalPrice.toLocaleString()} F</span>
                </div>
              </div>

              {step === 1 ? (
                <Button className="w-full h-14 rounded-2xl text-lg font-bold" disabled={selectedSeats.length === 0} onClick={handleNextStep}>Continuer</Button>
              ) : (
                <Button className="w-full h-14 rounded-2xl text-lg font-bold" isLoading={bookingLoading} onClick={handleFinalBooking}>Réserver maintenant</Button>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

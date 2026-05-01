"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bus, ChevronLeft, AlertCircle, Loader2, Lock, MapPin, Clock, Users,
} from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface Seat {
  id: string;
  seatNumber: number;
  type: string;
  rowPos: number;
  colPos: number;
  status: "available" | "occupied" | "locked";
}

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  price: string;
  availableSeats: number;
  route: {
    departureStation: { name: string; city: string };
    arrivalStation: { name: string; city: string };
    durationMin: number | null;
  };
  bus: { plateNumber: string; type: string };
  company: { name: string; certified: boolean };
}

const STEPS = [
  { n: 1, label: "Sièges" },
  { n: 2, label: "Passagers" },
  { n: 3, label: "Paiement" },
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Array<{ name: string; phone: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedRes, seatsRes] = await Promise.all([
          api.get(`/schedules/${params.scheduleId}`),
          api.get(`/schedules/${params.scheduleId}/seats`),
        ]);
        setSchedule(schedRes.data.data);
        setSeats(seatsRes.data.data || []);
      } catch {
        setError("Impossible de charger ce trajet.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.scheduleId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "available") return;
    setError(null);
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 5) { setError("Maximum 5 sièges par réservation."); return; }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleNextStep = () => {
    if (selectedSeats.length === 0) { setError("Sélectionnez au moins un siège."); return; }
    setPassengers(selectedSeats.map(() => ({ name: "", phone: "" })));
    setStep(2);
    setError(null);
  };

  const updatePassenger = (index: number, field: "name" | "phone", value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleFinalBooking = async () => {
    if (passengers.some(p => !p.name.trim() || !p.phone.trim())) {
      setError("Remplissez le nom et le téléphone de chaque passager.");
      return;
    }
    setBookingLoading(true);
    setError(null);
    try {
      const response = await api.post("/bookings", {
        scheduleId: schedule!.id,
        seats: selectedSeats.map((seat, i) => ({
          seatId: seat.id,
          passengerName: passengers[i].name,
          passengerPhone: passengers[i].phone,
        })),
      });
      const bookings = response.data.data;
      if (bookings?.length > 0) {
        router.push(`/booking/payment/${bookings[0].id}`);
      }
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Erreur lors de la réservation. Réessayez.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <Loader2 className="animate-spin text-primary w-12 h-12" />
    </div>
  );

  if (!schedule) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <p className="text-foreground/40 font-bold text-lg mb-4">Trajet introuvable</p>
        <Button onClick={() => router.push("/search")}>Retour à la recherche</Button>
      </div>
    </div>
  );

  const totalPrice = parseInt(schedule.price) * selectedSeats.length;
  const deptTime = new Date(schedule.departureTime).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const deptDate = new Date(schedule.departureTime).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  // Organiser les sièges par rangée
  const seatsByRow = seats.reduce<Record<number, Seat[]>>((acc, seat) => {
    if (!acc[seat.rowPos]) acc[seat.rowPos] = [];
    acc[seat.rowPos].push(seat);
    return acc;
  }, {});
  const rows = Object.keys(seatsByRow).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header sticky */}
      <div className="bg-white border-b border-border sticky top-0 z-30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : router.back()}
            className="flex items-center gap-2 text-foreground/60 hover:text-primary font-semibold transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {step === 2 ? "Retour aux sièges" : "Retour"}
          </button>

          {/* Stepper */}
          <div className="flex items-center gap-6">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className={cn(
                  "flex items-center gap-2 text-sm font-bold transition-colors",
                  step >= s.n ? "text-primary" : "text-foreground/20"
                )}>
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                    step > s.n ? "bg-primary text-white" :
                    step === s.n ? "bg-primary text-white ring-4 ring-primary/20" :
                    "bg-surface-100 border border-border text-foreground/30"
                  )}>
                    {s.n}
                  </span>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("w-8 h-0.5 transition-colors", step > s.n ? "bg-primary" : "bg-border")} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="w-24" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">

            {/* Résumé du trajet */}
            <Card className="p-6 border-none shadow-voyago rounded-2xl bg-white">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">{schedule.route.departureStation.city}</span>
                    <div className="flex-grow h-px border-t border-dashed border-border mx-2" />
                    <span className="font-black text-lg">{schedule.route.arrivalStation.city}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-foreground/40 font-semibold">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{deptDate} à {deptTime}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{schedule.availableSeats} places restantes</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Par siège</p>
                  <p className="text-2xl font-black text-primary">{parseInt(schedule.price).toLocaleString()} F</p>
                </div>
              </div>
            </Card>

            {/* Étape 1 : Sélection des sièges */}
            {step === 1 && (
              <Card className="p-8 border-none shadow-voyago rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black">Plan du bus</h2>
                  <Badge variant="info" className="bg-primary/10 text-primary border-none font-bold">
                    {selectedSeats.length} sélectionné{selectedSeats.length > 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Légende */}
                <div className="flex items-center gap-6 mb-8 text-[11px] font-bold text-foreground/40">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white border-2 border-border" />
                    Libre
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary border-2 border-primary" />
                    Sélectionné
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-border/20 border-2 border-transparent" />
                    Occupé
                  </div>
                </div>

                {/* Grille de sièges par rangée */}
                <div className="bg-surface-100 rounded-2xl p-6 max-w-sm mx-auto space-y-3">
                  {/* Indicateur avant du bus */}
                  <div className="flex items-center justify-center gap-2 mb-4 text-[10px] font-black uppercase text-foreground/30 tracking-widest">
                    <div className="flex-grow h-px bg-border/50" />
                    <Bus className="w-4 h-4" /> AVANT
                    <div className="flex-grow h-px bg-border/50" />
                  </div>
                  {rows.map(rowNum => (
                    <div key={rowNum} className="flex items-center gap-2 justify-center">
                      <span className="text-[10px] font-black text-foreground/20 w-4 text-right">{rowNum}</span>
                      <div className="flex gap-2">
                        {seatsByRow[rowNum]
                          .sort((a, b) => a.colPos - b.colPos)
                          .map((seat, colIdx) => (
                            <React.Fragment key={seat.id}>
                              {/* Allée centrale entre col 2 et 3 */}
                              {colIdx === 2 && <div className="w-4" />}
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={seat.status !== "available"}
                                className={cn(
                                  "w-10 h-10 rounded-lg text-xs font-bold border-2 transition-all duration-150 flex items-center justify-center",
                                  seat.status === "occupied" || seat.status === "locked"
                                    ? "bg-border/20 border-transparent text-foreground/20 cursor-not-allowed"
                                    : selectedSeats.find(s => s.id === seat.id)
                                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105"
                                      : "bg-white border-border hover:border-primary/50 hover:bg-primary/5 text-foreground/60 cursor-pointer"
                                )}
                              >
                                {seat.status === "occupied" || seat.status === "locked"
                                  ? <Lock className="w-3 h-3" />
                                  : seat.seatNumber}
                              </button>
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSeats.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedSeats.sort((a, b) => a.seatNumber - b.seatNumber).map(s => (
                      <span key={s.id} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
                        Siège {s.seatNumber}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Étape 2 : Informations passagers */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-black">Informations des passagers</h2>
                {selectedSeats.map((seat, index) => (
                  <Card key={seat.id} className="p-8 border-none shadow-voyago rounded-3xl space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-black">
                        {index + 1}
                      </div>
                      <h3 className="font-bold">Passager — Siège <span className="text-primary">#{seat.seatNumber}</span></h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom complet"
                        value={passengers[index]?.name || ""}
                        onChange={(e) => updatePassenger(index, "name", e.target.value)}
                        placeholder="Ex: Koffi Mensah"
                      />
                      <Input
                        label="Téléphone"
                        value={passengers[index]?.phone || ""}
                        onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                        placeholder="Ex: 90123456"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Récapitulatif sidebar */}
          <aside>
            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white sticky top-24 space-y-6">
              <h3 className="font-black text-xs uppercase text-foreground/40 tracking-widest">Récapitulatif</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/50">Trajet</span>
                  <span className="font-bold">{schedule.route.departureStation.city} → {schedule.route.arrivalStation.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Compagnie</span>
                  <span className="font-bold">{schedule.company.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Départ</span>
                  <span className="font-bold">{deptDate} à {deptTime}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground/50">Sièges</span>
                    <span className="font-bold">{selectedSeats.map(s => `#${s.seatNumber}`).join(", ")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-border">
                  <span className="font-black">Total</span>
                  <span className="text-2xl font-black text-primary">
                    {totalPrice > 0 ? `${totalPrice.toLocaleString()} F` : "—"}
                  </span>
                </div>
              </div>

              {step === 1 ? (
                <Button
                  className="w-full h-14 rounded-2xl text-base font-black"
                  disabled={selectedSeats.length === 0}
                  onClick={handleNextStep}
                >
                  Continuer ({selectedSeats.length} siège{selectedSeats.length > 1 ? "s" : ""})
                </Button>
              ) : (
                <Button
                  className="w-full h-14 rounded-2xl text-base font-black"
                  isLoading={bookingLoading}
                  onClick={handleFinalBooking}
                >
                  Confirmer et payer
                </Button>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <p className="text-[10px] text-foreground/30 text-center leading-relaxed font-medium">
                Votre siège sera réservé pendant 15 minutes après confirmation.
              </p>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

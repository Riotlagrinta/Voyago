"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight,
  Filter,
  Loader2,
  Search as SearchIcon,
  ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TripCardSkeleton } from "@/components/ui/TripCardSkeleton";
import api from "@/lib/api";

interface Schedule {
  id: string;
  departure: string;
  price: string;
  availableSeats: number;
  route: {
    departureStation: { name: string; city: string };
    arrivalStation: { name: string; city: string };
    durationMin: number;
  };
  bus: {
    plateNumber: string;
    type: string;
  };
  company: {
    name: string;
    logoUrl?: string;
    certified: boolean;
  };
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const departure = searchParams.get("departure");
  const arrival = searchParams.get("arrival");
  const date = searchParams.get("date");

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/schedules", {
          params: {
            departure,
            arrival,
            date,
          },
        });
        setSchedules(response.data.data || []);
      } catch (err) {
        setError("Impossible de charger les trajets. RÃ©essayez plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [departure, arrival, date]);

  const handleBook = (scheduleId: string) => {
    router.push(`/booking/${scheduleId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Search Form */}
      <div className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className="bg-primary p-1.5 rounded-lg shadow-sm shadow-primary/20">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Voyago</span>
          </div>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            <Input
              defaultValue={departure || ""}
              placeholder="DÃ©part"
              leftIcon={<MapPin className="text-primary w-4 h-4" />}
              className="h-10 border-none bg-surface-100"
            />
            <Input
              defaultValue={arrival || ""}
              placeholder="ArrivÃ©e"
              leftIcon={<MapPin className="text-primary w-4 h-4" />}
              className="h-10 border-none bg-surface-100"
            />
            <Input
              type="date"
              defaultValue={date || ""}
              leftIcon={<Calendar className="text-primary w-4 h-4" />}
              className="h-10 border-none bg-surface-100"
            />
          </div>

          <Button size="sm" className="w-full md:w-auto px-6 h-10 rounded-xl font-bold shadow-md shadow-primary/10" leftIcon={<SearchIcon className="w-4 h-4" />}>
            Modifier
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div>
            <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground/70">
              <Filter className="w-4 h-4 text-primary" /> Filtres
            </h3>
            <div className="space-y-4">
              <div className="bg-surface p-5 rounded-2xl border border-border/50 shadow-voyago">
                <label className="text-[10px] font-black uppercase text-foreground/30 mb-4 block tracking-widest">Heure de dÃ©part</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm font-bold text-foreground/60 cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded-lg border-border text-primary focus:ring-primary/20 transition-all" /> Matin (05:00 - 12:00)
                  </label>
                  <label className="flex items-center gap-3 text-sm font-bold text-foreground/60 cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded-lg border-border text-primary focus:ring-primary/20 transition-all" /> AprÃ¨s-midi (12:00 - 18:00)
                  </label>
                  <label className="flex items-center gap-3 text-sm font-bold text-foreground/60 cursor-pointer hover:text-primary transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded-lg border-border text-primary focus:ring-primary/20 transition-all" /> Soir (18:00 - 00:00)
                  </label>
                </div>
              </div>

              <div className="bg-surface p-5 rounded-2xl border border-border/50 shadow-voyago">
                <label className="text-[10px] font-black uppercase text-foreground/30 mb-4 block tracking-widest">Prix maximum</label>
                <input type="range" className="w-full h-1.5 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                <div className="flex justify-between text-[10px] mt-3 font-black text-foreground/40 uppercase">
                  <span>2 000 F</span>
                  <span>15 000 F</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-lg font-bold text-foreground/80">
              {loading ? "Recherche..." : <><span className="text-primary">{schedules.length}</span> trajets trouvÃ©s</>}
            </h2>
            <select className="bg-surface border border-border/50 rounded-xl px-4 py-2 text-xs font-bold text-foreground/60 outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer">
              <option>Le moins cher</option>
              <option>Le plus rapide</option>
              <option>Le plus tÃ´t</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-500/5 text-rose-500 p-10 rounded-3xl text-center border border-rose-500/10">
              <p className="font-bold">{error}</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-surface p-16 rounded-[2.5rem] text-center border border-dashed border-border shadow-voyago">
              <div className="bg-surface-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Bus className="text-foreground/10 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-3">Aucun trajet disponible</h3>
              <p className="text-foreground/40 max-w-xs mx-auto text-sm font-medium">
                Essayez d'autres villes ou changez la date de votre voyage pour voir plus d'options.
              </p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <Card key={schedule.id} hoverable className="p-0 overflow-hidden border border-border/50 shadow-voyago group rounded-[2rem]">
                <div className="flex flex-col md:flex-row">
                  {/* Info Left */}
                  <div className="flex-grow p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl flex items-center gap-2 border border-primary/10">
                        <Bus className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-wider">{schedule.bus.type}</span>
                      </div>
                      <Badge variant="default" className="bg-transparent text-foreground/40 font-mono text-[10px] font-bold py-1 px-3 border border-border/50">{schedule.bus.plateNumber}</Badge>
                      {schedule.company.certified && (
                        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
                          <ShieldCheck className="w-3.5 h-3.5 fill-blue-500 text-white" /> CertifiÃ©e
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between relative px-2">
                      <div className="text-center z-10 bg-surface pr-6 py-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                          {new Date(schedule.departure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <p className="text-[10px] font-black uppercase text-foreground/30 mt-2 tracking-widest">{schedule.route.departureStation.city}</p>       
                      </div>

                      <div className="flex-grow border-t-2 border-dashed border-border/40 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-100 p-2 rounded-full border border-border/20 shadow-sm">
                          <Bus className="w-4 h-4 text-primary" />
                        </div>
                      </div>

                      <div className="text-center z-10 bg-surface pl-6 py-2">
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                          {new Date(new Date(schedule.departure).getTime() + (schedule.route.durationMin || 0) * 60000).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <p className="text-[10px] font-black uppercase text-foreground/30 mt-2 tracking-widest">{schedule.route.arrivalStation.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border/30">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50 bg-surface-100 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {Math.floor((schedule.route.durationMin || 0) / 60)}h {(schedule.route.durationMin || 0) % 60}min
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/50 bg-surface-100 px-3 py-1.5 rounded-lg">
                        <Users className="w-3.5 h-3.5 text-primary" /> {schedule.availableSeats} places libres
                      </div>
                      <div className="ml-auto text-[11px] font-black uppercase text-foreground/30 italic">
                        {schedule.company.name}
                      </div>
                    </div>
                  </div>

                  {/* Price Right */}
                  <div className="bg-surface-50 md:w-72 p-10 flex flex-col justify-center items-center md:border-l border-border/50 gap-6">  
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase text-foreground/30 block mb-2 tracking-[0.2em]">Prix par siÃ¨ge</span>
                      <span className="text-4xl font-black text-primary tracking-tighter">
                        {parseInt(schedule.price || "0").toLocaleString("fr-FR")} <span className="text-sm">F</span>
                      </span>
                    </div>
                    <Button
                      className="w-full rounded-2xl py-6 h-auto text-md font-black uppercase tracking-wider group-hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 active:scale-95"
                      onClick={() => handleBook(schedule.id)}
                    >
                      RÃ©server <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <p className="text-[10px] font-bold text-foreground/30 text-center leading-relaxed">
                      Confirmation instantanÃ©e par SMS <br /> aprÃ¨s paiement sÃ©curisÃ©
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

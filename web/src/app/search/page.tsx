"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
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
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TripCardSkeleton } from "@/components/ui/TripCardSkeleton";
import api from "@/lib/api";

interface Schedule {
  id: string;
  departureTime: string;
  arrivalTime: string | null;
  price: string;
  availableSeats: number;
  status: string;
  route: {
    departureStation: { name: string; city: string };
    arrivalStation: { name: string; city: string };
    durationMin: number | null;
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

type SortKey = "price_asc" | "price_desc" | "time_asc" | "duration_asc";

interface Filters {
  morning: boolean;   // 05:00–12:00
  afternoon: boolean; // 12:00–18:00
  evening: boolean;   // 18:00–00:00
  maxPrice: number;
}

const MAX_PRICE = 15000;

function formatDuration(min: number | null): string {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${m}min`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getArrivalTime(schedule: Schedule): string {
  if (schedule.arrivalTime) return formatTime(schedule.arrivalTime);
  if (schedule.route.durationMin) {
    const arrival = new Date(new Date(schedule.departureTime).getTime() + schedule.route.durationMin * 60000);
    return arrival.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return "—";
}

function getHour(iso: string): number {
  return new Date(iso).getHours();
}

function applyFilters(schedules: Schedule[], filters: Filters): Schedule[] {
  const timeActive = filters.morning || filters.afternoon || filters.evening;
  return schedules.filter((s) => {
    const price = parseInt(s.price || "0");
    if (price > filters.maxPrice) return false;
    if (timeActive) {
      const h = getHour(s.departureTime);
      const ok =
        (filters.morning && h >= 5 && h < 12) ||
        (filters.afternoon && h >= 12 && h < 18) ||
        (filters.evening && h >= 18);
      if (!ok) return false;
    }
    return true;
  });
}

function applySort(schedules: Schedule[], sort: SortKey): Schedule[] {
  return [...schedules].sort((a, b) => {
    switch (sort) {
      case "price_asc":  return parseInt(a.price) - parseInt(b.price);
      case "price_desc": return parseInt(b.price) - parseInt(a.price);
      case "time_asc":   return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case "duration_asc": return (a.route.durationMin ?? 9999) - (b.route.durationMin ?? 9999);
      default: return 0;
    }
  });
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [departure, setDeparture] = useState(searchParams.get("departure") ?? "");
  const [arrival, setArrival]     = useState(searchParams.get("arrival") ?? "");
  const [date, setDate]           = useState(searchParams.get("date") ?? "");

  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const [sort, setSort]       = useState<SortKey>("time_asc");
  const [filters, setFilters] = useState<Filters>({
    morning: false,
    afternoon: false,
    evening: false,
    maxPrice: MAX_PRICE,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchSchedules = useCallback(async (dep: string, arr: string, dt: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/schedules", {
        params: {
          ...(dep && { departure: dep }),
          ...(arr && { arrival: arr }),
          ...(dt  && { date: dt }),
        },
      });
      setAllSchedules(response.data.data ?? []);
    } catch {
      setError("Impossible de charger les trajets. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules(departure, arrival, date);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (departure) params.set("departure", departure);
    if (arrival)   params.set("arrival", arrival);
    if (date)      params.set("date", date);
    router.push(`/search?${params.toString()}`);
    fetchSchedules(departure, arrival, date);
  };

  const toggleFilter = (key: keyof Pick<Filters, "morning" | "afternoon" | "evening">) => {
    setFilters((f) => ({ ...f, [key]: !f[key] }));
  };

  const displayed = applySort(applyFilters(allSchedules, filters), sort);
  const hasActiveFilters = filters.morning || filters.afternoon || filters.evening || filters.maxPrice < MAX_PRICE;

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="bg-surface p-5 rounded-2xl border border-border/50 shadow-voyago">
        <label className="text-[10px] font-black uppercase text-foreground/30 mb-4 block tracking-widest">
          Heure de départ
        </label>
        <div className="space-y-3">
          {([
            { key: "morning",   label: "Matin (05:00–12:00)" },
            { key: "afternoon", label: "Après-midi (12:00–18:00)" },
            { key: "evening",   label: "Soir (18:00–00:00)" },
          ] as const).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm font-bold text-foreground/60 cursor-pointer hover:text-primary transition-colors">
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => toggleFilter(key)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-surface p-5 rounded-2xl border border-border/50 shadow-voyago">
        <label className="text-[10px] font-black uppercase text-foreground/30 mb-4 block tracking-widest">
          Prix maximum
        </label>
        <input
          type="range"
          min={2000}
          max={MAX_PRICE}
          step={500}
          value={filters.maxPrice}
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: parseInt(e.target.value) }))}
          className="w-full h-1.5 bg-surface-100 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] mt-3 font-black text-foreground/40 uppercase">
          <span>2 000 F</span>
          <span className="text-primary">{filters.maxPrice.toLocaleString("fr-FR")} F</span>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => setFilters({ morning: false, afternoon: false, evening: false, maxPrice: MAX_PRICE })}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 py-2 transition-colors"
        >
          <X className="w-3 h-3" /> Effacer les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search header */}
      <div className="bg-surface/90 backdrop-blur-md border-b border-border sticky top-0 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center">
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => router.push("/")}
          >
            <div className="bg-primary p-1.5 rounded-lg shadow-sm shadow-primary/20">
              <Bus className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">Voyago</span>
          </div>

          <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <input
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Départ"
                className="w-full h-10 pl-9 pr-3 bg-surface-100 rounded-xl text-sm font-semibold text-foreground placeholder:text-foreground/30 border-none outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <input
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Arrivée"
                className="w-full h-10 pl-9 pr-3 bg-surface-100 rounded-xl text-sm font-semibold text-foreground placeholder:text-foreground/30 border-none outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-4 h-4 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-surface-100 rounded-xl text-sm font-semibold text-foreground border-none outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSearch}
            className="w-full md:w-auto px-6 h-10 rounded-xl font-bold shadow-md shadow-primary/10 shrink-0"
          >
            <SearchIcon className="w-4 h-4 mr-2" /> Chercher
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block space-y-4">
          <h3 className="font-bold flex items-center gap-2 text-foreground/70">
            <Filter className="w-4 h-4 text-primary" /> Filtres
          </h3>
          <FilterPanel />
        </aside>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-foreground/70">
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /> Recherche…</span>
                ) : (
                  <><span className="text-primary font-black">{displayed.length}</span> trajet{displayed.length > 1 ? "s" : ""} trouvé{displayed.length > 1 ? "s" : ""}</>
                )}
              </h2>
              {/* Mobile filter toggle */}
              <button
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-foreground/60 bg-surface border border-border/50 px-3 py-1.5 rounded-xl"
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtres {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
              </button>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-surface border border-border/50 rounded-xl px-3 py-2 text-xs font-bold text-foreground/60 outline-none focus:ring-2 focus:ring-primary/10 cursor-pointer"
            >
              <option value="time_asc">Le plus tôt</option>
              <option value="price_asc">Le moins cher</option>
              <option value="price_desc">Le plus cher</option>
              <option value="duration_asc">Le plus rapide</option>
            </select>
          </div>

          {/* Mobile filters drawer */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowMobileFilters(false)}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">Filtres</h3>
                  <button onClick={() => setShowMobileFilters(false)}><X className="w-5 h-5" /></button>
                </div>
                <FilterPanel />
                <Button className="w-full" onClick={() => setShowMobileFilters(false)}>
                  Voir {displayed.length} résultat{displayed.length > 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <TripCardSkeleton key={i} />)}
            </div>
          ) : error ? (
            <div className="bg-rose-500/5 text-rose-500 p-10 rounded-3xl text-center border border-rose-500/10">
              <p className="font-bold">{error}</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="bg-surface p-16 rounded-[2.5rem] text-center border border-dashed border-border shadow-voyago">
              <div className="bg-surface-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Bus className="text-foreground/10 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-3">Aucun trajet disponible</h3>
              <p className="text-foreground/40 max-w-xs mx-auto text-sm font-medium">
                {hasActiveFilters
                  ? "Aucun trajet ne correspond à vos filtres. Essayez de les élargir."
                  : "Essayez d'autres villes ou changez la date de votre voyage."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ morning: false, afternoon: false, evening: false, maxPrice: MAX_PRICE })}
                  className="mt-4 text-sm font-bold text-primary hover:underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            displayed.map((schedule) => (
              <Card
                key={schedule.id}
                hoverable
                className="p-0 overflow-hidden border border-border/50 shadow-voyago group rounded-[2rem]"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left — trip info */}
                  <div className="flex-grow p-7 md:p-9">
                    {/* Bus meta */}
                    <div className="flex items-center gap-3 mb-7 flex-wrap">
                      <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-xl flex items-center gap-2 border border-primary/10">
                        <Bus className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          {schedule.bus.type}
                        </span>
                      </div>
                      <Badge
                        variant="default"
                        className="bg-transparent text-foreground/40 font-mono text-[10px] py-1 px-3 border border-border/50"
                      >
                        {schedule.bus.plateNumber}
                      </Badge>
                      {schedule.company.certified && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
                          <ShieldCheck className="w-3.5 h-3.5 fill-blue-500 text-white" /> Certifiée
                        </div>
                      )}
                    </div>

                    {/* Route timeline */}
                    <div className="flex items-center gap-4 relative">
                      <div className="text-center z-10 bg-surface pr-4 py-1">
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                          {formatTime(schedule.departureTime)}
                        </span>
                        <p className="text-[10px] font-black uppercase text-foreground/30 mt-1.5 tracking-widest">
                          {schedule.route.departureStation.city}
                        </p>
                      </div>

                      <div className="flex-grow border-t-2 border-dashed border-border/40 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-100 p-1.5 rounded-full border border-border/20 shadow-sm">
                          <Bus className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>

                      <div className="text-center z-10 bg-surface pl-4 py-1">
                        <span className="text-3xl font-black text-foreground tracking-tighter">
                          {getArrivalTime(schedule)}
                        </span>
                        <p className="text-[10px] font-black uppercase text-foreground/30 mt-1.5 tracking-widest">
                          {schedule.route.arrivalStation.city}
                        </p>
                      </div>
                    </div>

                    {/* Footer meta */}
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-border/30 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/50 bg-surface-100 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {formatDuration(schedule.route.durationMin)}
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg ${
                        schedule.availableSeats <= 5
                          ? "bg-amber-50 text-amber-600"
                          : "bg-surface-100 text-foreground/50"
                      }`}>
                        <Users className="w-3.5 h-3.5" />
                        {schedule.availableSeats <= 5
                          ? `Plus que ${schedule.availableSeats} place${schedule.availableSeats > 1 ? "s" : ""} !`
                          : `${schedule.availableSeats} places libres`}
                      </div>
                      <span className="ml-auto text-[11px] font-black uppercase text-foreground/30 italic">
                        {schedule.company.name}
                      </span>
                    </div>
                  </div>

                  {/* Right — price + CTA */}
                  <div className="bg-surface-50 md:w-64 p-8 flex flex-col justify-center items-center md:border-l border-border/50 gap-5">
                    <div className="text-center">
                      <span className="text-[10px] font-black uppercase text-foreground/30 block mb-1 tracking-[0.2em]">
                        Prix / siège
                      </span>
                      <span className="text-4xl font-black text-primary tracking-tighter">
                        {parseInt(schedule.price || "0").toLocaleString("fr-FR")}
                        <span className="text-base ml-1">F</span>
                      </span>
                    </div>
                    <Button
                      className="w-full rounded-2xl py-5 h-auto font-black uppercase tracking-wide group-hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
                      onClick={() => router.push(`/booking/${schedule.id}`)}
                    >
                      Réserver <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <p className="text-[10px] font-bold text-foreground/30 text-center leading-relaxed">
                      Confirmation instantanée par SMS
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

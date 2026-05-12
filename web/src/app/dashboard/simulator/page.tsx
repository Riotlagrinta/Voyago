"use client";

import React, { useEffect, useState } from "react";
import {
  Navigation,
  RefreshCw,
  Loader2,
  ExternalLink,
  ArrowRight,
  Bus as BusIcon,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import DriverSimulator from "@/components/DriverSimulator";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Schedule {
  id: string;
  departureTime: string;
  status: string;
  price: string;
  availableSeats: number;
  route: {
    departureStation: { city: string };
    arrivalStation: { city: string };
  };
  bus: { plateNumber: string };
  driver?: { name: string };
}

export default function SimulatorPage() {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/schedules");
      const data: Schedule[] = res.data.data || [];
      // Show only upcoming or ongoing schedules
      const relevant = data.filter(s => s.status !== "cancelled" && s.status !== "completed");
      setSchedules(relevant);
      if (relevant.length > 0 && !activeScheduleId) {
        setActiveScheduleId(relevant[0].id);
      }
    } catch (err) {
      console.error("Erreur chargement horaires", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const selected = schedules.find(s => s.id === activeScheduleId);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Simulateur GPS</h2>
          </div>
          <p className="text-foreground/40 font-medium ml-[52px]">
            Testez le suivi en temps réel sans appareil physique. Émission Socket.io vers les passagers.
          </p>
        </div>
        <Button
          variant="ghost"
          className="rounded-2xl border border-border"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={fetchSchedules}
        >
          Actualiser
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
        <Navigation className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-orange-700">Mode MVP — Simulation GPS</p>
          <p className="text-xs text-orange-600 mt-0.5">
            Le simulateur émet des positions GPS réelles via Socket.io toutes les 3 secondes.
            Les passagers sur <strong>/tracking/[id]</strong> reçoivent le signal en temps réel.
            Les données sont enregistrées en base toutes les 30 secondes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Selector */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-black text-foreground">Sélectionner un trajet</h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : schedules.length === 0 ? (
            <Card className="p-6 border-none shadow-voyago rounded-3xl text-center">
              <BusIcon className="w-10 h-10 text-foreground/20 mx-auto mb-3" />
              <p className="font-bold text-sm text-foreground/40">Aucun trajet disponible</p>
              <p className="text-xs text-foreground/30 mt-1">Créez d'abord un horaire dans Planning</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveScheduleId(s.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    activeScheduleId === s.id
                      ? "border-orange-400 bg-orange-50 shadow-lg shadow-orange-100"
                      : "border-border bg-white hover:border-orange-200 hover:bg-orange-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span>{s.route.departureStation.city}</span>
                      <ArrowRight className="w-3 h-3 text-foreground/30" />
                      <span>{s.route.arrivalStation.city}</span>
                    </div>
                    <Badge
                      variant={s.status === "ongoing" ? "success" : "info"}
                      className="text-[10px]"
                    >
                      {s.status === "ongoing" ? "En cours" : "Programmé"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground/40 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(s.departureTime).toLocaleString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <BusIcon className="w-3 h-3" />
                      {s.bus.plateNumber}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-foreground/20 mt-2 truncate">
                    ID: {s.id}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simulator + Tracking Link */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-black text-foreground">Contrôle du simulateur</h3>

          {activeScheduleId ? (
            <>
              <DriverSimulator scheduleId={activeScheduleId} />

              {/* Link to tracking page */}
              <Card className="p-5 border-none shadow-voyago rounded-2xl bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">Voir le suivi passager</p>
                    <p className="text-xs text-foreground/40 mt-0.5">
                      Ouvrir la page de suivi en temps réel dans un nouvel onglet
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl border border-border"
                    rightIcon={<ExternalLink className="w-4 h-4" />}
                    onClick={() => window.open(`/tracking/${activeScheduleId}`, "_blank")}
                  >
                    Ouvrir
                  </Button>
                </div>
                {selected && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-2">
                      Trajet sélectionné
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span>{selected.route.departureStation.city}</span>
                      <ArrowRight className="w-3 h-3 text-foreground/30" />
                      <span>{selected.route.arrivalStation.city}</span>
                      <span className="text-foreground/40 font-mono text-xs ml-auto">
                        #{selected.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Instructions */}
              <Card className="p-5 border-none shadow-voyago rounded-2xl">
                <p className="text-xs font-black text-foreground/40 uppercase tracking-widest mb-3">
                  Comment tester
                </p>
                <ol className="space-y-2 text-xs text-foreground/60 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">1</span>
                    Sélectionne un trajet dans la liste de gauche
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">2</span>
                    Ouvre le lien "Voir le suivi passager" dans un autre onglet
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">3</span>
                    Clique sur <strong>"Démarrer le trajet"</strong> — le bus commence à bouger sur la carte
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">4</span>
                    La carte se met à jour en temps réel toutes les 3 secondes via WebSocket
                  </li>
                </ol>
              </Card>
            </>
          ) : (
            <Card className="p-12 border-none shadow-voyago rounded-3xl text-center bg-slate-50">
              <Navigation className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <p className="font-bold text-foreground/40">
                Sélectionnez un trajet pour démarrer le simulateur
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

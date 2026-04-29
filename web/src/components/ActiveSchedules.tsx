"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, ChevronRight, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface ActiveSchedule {
  id: string;
  route: {
    departureStation: { city: string };
    arrivalStation: { city: string };
  };
  bus: { plateNumber: string; type: string };
  company: { name: string };
}

export default function ActiveSchedules() {
  const [schedules, setSchedules] = useState<ActiveSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const { data } = await api.get("/schedules");
        // On simule des trajets "en cours" pour la démo
        setSchedules(data.data.slice(0, 2));
      } catch (error) {
        console.error("Erreur géo-tracking accueil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  if (loading) return null;
  if (schedules.length === 0) return null;

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Trajets en cours</h2>
              <p className="text-sm text-foreground/50">Suivez vos proches en temps réel par GPS</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary font-bold" onClick={() => router.push("/search")}>
            Voir tout <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule, idx) => (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 border-border/50 hover:border-primary/30 transition-all bg-surface-50 group cursor-pointer" 
                    onClick={() => router.push(`/tracking/${schedule.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{schedule.company.name}</span>
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <span>{schedule.route.departureStation.city}</span>
                      <Navigation className="w-4 h-4 text-primary rotate-90" />
                      <span>{schedule.route.arrivalStation.city}</span>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Live GPS</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-xs text-foreground/60 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>En route</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/60 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{schedule.bus.plateNumber}</span>
                  </div>
                  <Button size="sm" className="ml-auto rounded-lg h-8 px-4 text-[11px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                    Suivre le bus
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

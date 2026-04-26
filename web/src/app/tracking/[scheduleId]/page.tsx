"use client";

import React, { use } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Navigation, 
  Clock, 
  Zap, 
  WifiOff,
  Radio
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useGpsTracking } from "@/hooks/useGpsTracking";

// Import dynamique de la carte (Leaflet ne fonctionne que cÃ´tÃ© client)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-100 flex items-center justify-center">
      <Navigation className="w-8 h-8 text-primary animate-bounce" />
    </div>
  )
});

interface TrackingPageProps {
  params: Promise<{ scheduleId: string }>;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const { scheduleId } = use(params);
  const { position, speed, lastUpdate, isConnected, isPolling } = useGpsTracking(scheduleId);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header Premium */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/bookings" className="p-2 hover:bg-surface-100 rounded-full transition-all active:scale-90">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div>
            <h1 className="font-black text-lg leading-tight tracking-tight text-foreground uppercase italic">Suivi Direct</h1>
            <p className="text-[10px] font-bold text-foreground/40 flex items-center gap-1 uppercase tracking-widest">
              ID #{scheduleId.substring(0, 8)}
              {isConnected ? (
                <span className="flex items-center gap-1 text-emerald-500 font-black">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute opacity-75" />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full relative" />
                  LIVE
                </span>
              ) : isPolling ? (
                <span className="flex items-center gap-1 text-amber-500 font-black">
                   <Radio className="w-3 h-3 animate-pulse" /> POLLING
                </span>
              ) : (
                <span className="text-rose-500 animate-pulse font-black flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> OFFLINE
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10 hidden sm:block">
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-tighter text-right">Mise Ã  jour</p>
            <p className="text-[10px] font-bold text-primary uppercase">{lastUpdate || '--:--'}</p>
          </div>
          <Badge variant={isConnected ? "success" : "warning"} className="py-1.5 px-4 text-sm font-black shadow-lg rounded-xl border-none">
            {speed} km/h
          </Badge>
        </div>
      </header>

      {/* Conteneur de Carte */}
      <div className="flex-grow relative">
        <Map position={position} busName="Votre Bus Voyago" />

        {/* Info Card Flottante */}
        <div className="absolute bottom-10 inset-x-6 z-10 flex justify-center">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-surface/90 backdrop-blur-2xl border border-border p-6 rounded-[2rem] shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-2xl">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Dernier Signal</p>
                    <p className="text-sm font-bold text-foreground">{lastUpdate ? `Aujourd'hui Ã  ${lastUpdate}` : 'En attente...'}</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Vitesse</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">{speed} <span className="text-xs uppercase">km/h</span></p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
                <Zap className="w-5 h-5 text-primary animate-pulse" />
                <p className="text-xs font-bold text-primary leading-tight">
                  {isPolling 
                    ? "Mode rÃ©seau faible activÃ©. Actualisation toutes les 30s." 
                    : "Signal optimal. Suivi en temps rÃ©el activÃ©."}
                </p>
              </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}

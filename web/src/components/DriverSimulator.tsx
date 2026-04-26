"use client";

import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Play, Pause, Navigation, Info } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Itinéraire Togo : Lomé -> Tsévié -> Atakpamé -> Sokodé -> Kara
const TOGO_PATH = [
  [6.13, 1.22], // Lomé
  [6.25, 1.21],
  [6.42, 1.21], // Tsévié
  [6.75, 1.15],
  [7.05, 1.12],
  [7.53, 1.13], // Atakpamé
  [8.02, 1.11],
  [8.54, 1.12],
  [8.98, 1.14], // Sokodé
  [9.15, 1.16],
  [9.35, 1.18],
  [9.54, 1.19], // Kara
];

interface DriverSimulatorProps {
  scheduleId: string;
}

export default function DriverSimulator({ scheduleId }: DriverSimulatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    
    if (isRunning && socketRef.current) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % TOGO_PATH.length;
        setCurrentIndex(nextIndex);
        
        const [lat, lng] = TOGO_PATH[nextIndex];
        
        socketRef.current?.emit('update_location', {
          scheduleId,
          latitude: lat,
          longitude: lng,
          speed: Math.floor(Math.random() * (90 - 70) + 70) // Vitesse variable entre 70 et 90
        });
        
        console.log(`[Simulator] Position émise : ${lat}, ${lng} pour ${scheduleId}`);
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentIndex, scheduleId]);

  return (
    <Card className="p-6 border-none shadow-voyago rounded-[2rem] bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Navigation className="w-24 h-24 rotate-45" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight italic">Simulateur GPS</h3>
            <p className="text-[10px] text-white/40 font-bold">MODE TEST MVP</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black text-white/30 uppercase mb-1">Position Actuelle</p>
            <p className="font-mono text-sm font-bold text-orange-400">
              {TOGO_PATH[currentIndex][0].toFixed(4)}, {TOGO_PATH[currentIndex][1].toFixed(4)}
            </p>
          </div>
          
          <div className="flex justify-between items-center px-2">
            <div className="text-center">
              <p className="text-[8px] font-black text-white/20 uppercase">Départ</p>
              <p className="text-[10px] font-bold">Lomé</p>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-white/10 relative">
               <div 
                 className="absolute top-1/2 -translate-y-1/2 h-2 w-2 bg-orange-500 rounded-full transition-all duration-500"
                 style={{ left: `${(currentIndex / (TOGO_PATH.length - 1)) * 100}%` }}
               />
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-white/20 uppercase">Arrivée</p>
              <p className="text-[10px] font-bold">Kara</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "w-full h-14 rounded-2xl font-black text-lg transition-all",
            isRunning ? "bg-rose-500 hover:bg-rose-600" : "bg-orange-500 hover:bg-orange-600"
          )}
          leftIcon={isRunning ? <Pause /> : <Play />}
        >
          {isRunning ? "Arrêter le trajet" : "Démarrer le trajet"}
        </Button>

        {isRunning && (
          <div className="mt-4 flex items-center justify-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest text-center">Émission en direct...</span>
          </div>
        )}
      </div>
    </Card>
  );
}

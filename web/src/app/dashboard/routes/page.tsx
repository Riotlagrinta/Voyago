"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  ArrowRight, 
  MapPin, 
  Loader2, 
  Clock, 
  Trash2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Route as RouteIcon
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/api";

interface Route {
  id: string;
  departureStation: { name: string; city: string };
  arrivalStation: { name: string; city: string };
  distanceKm: string;
  durationMin: number;
}

interface Station { id: string; name: string; city: string }

export default function RoutesManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    departureStationId: "",
    arrivalStationId: "",
    distanceKm: "",
    durationMin: ""
  });

  const fetchData = async () => {
    try {
      const [routesRes, stationsRes] = await Promise.all([
        api.get("/routes"),
        api.get("/stations")
      ]);
      setRoutes(routesRes.data.data || []);
      setStations(stationsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoute = async () => {
    try {
      await api.post("/routes", {
        ...formData,
        distanceKm: Number(formData.distanceKm),
        durationMin: Number(formData.durationMin)
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Nos Lignes & Itinéraires</h2>
          <p className="text-foreground/40 font-medium">Définissez vos trajets réguliers entre les différentes gares.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Nouvelle Ligne
        </Button>
      </div>

      <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-foreground/40">Chargement de vos itinéraires...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="p-6 bg-surface/50 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-voyago transition-all duration-300 group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <RouteIcon className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Départ</p>
                    <h4 className="font-black text-lg">{route.departureStation.city}</h4>
                    <p className="text-xs text-foreground/60">{route.departureStation.name}</p>
                  </div>
                  <div className="flex-shrink-0 text-primary/20">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  <div className="flex-grow text-right">
                    <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Arrivée</p>
                    <h4 className="font-black text-lg">{route.arrivalStation.city}</h4>
                    <p className="text-xs text-foreground/60">{route.arrivalStation.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40">
                      <Clock className="w-3.5 h-3.5" /> {Math.floor(route.durationMin / 60)}h {route.durationMin % 60}min
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/40">
                      <MapPin className="w-3.5 h-3.5" /> {route.distanceKm} km
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase">Détails <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </div>
              </div>
            ))}
            {routes.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40 italic">Aucun itinéraire défini.</div>
            )}
          </div>
        )}
      </Card>

      {/* Create Route Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter un itinéraire"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateRoute} className="px-8">Confirmer</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Station de départ</label>
              <select 
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.departureStationId}
                onChange={(e) => setFormData({...formData, departureStationId: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.city} - {s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Station d'arrivée</label>
              <select 
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.arrivalStationId}
                onChange={(e) => setFormData({...formData, arrivalStationId: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.city} - {s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Distance (km)" 
              type="number" 
              placeholder="420"
              value={formData.distanceKm}
              onChange={(e) => setFormData({...formData, distanceKm: e.target.value})}
            />
            <Input 
              label="Durée estimée (minutes)" 
              type="number" 
              placeholder="360"
              value={formData.durationMin}
              onChange={(e) => setFormData({...formData, durationMin: e.target.value})}
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/60 leading-relaxed">
              Une fois l'itinéraire créé, vous pourrez y ajouter des escales intermédiaires et programmer des départs sur cette ligne.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

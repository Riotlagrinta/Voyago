"use client";

import React, { useEffect, useState } from "react";
import { 
  MapPin, 
  Plus, 
  Search, 
  Loader2,
  Trash2,
  Edit2,
  Navigation
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/api";

interface Station {
  id: string;
  name: string;
  city: string;
  address?: string;
}

export default function AdminStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", city: "", address: "" });

  const fetchStations = async () => {
    try {
      const response = await api.get("/stations");
      setStations(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleCreateStation = async () => {
    try {
      await api.post("/stations", newStation);
      setIsModalOpen(false);
      setNewStation({ name: "", city: "", address: "" });
      fetchStations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Points d'Arrêt & Gares</h2>
          <p className="text-slate-500 font-medium">Gérez le catalogue global des stations de bus au Togo.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Nouvelle Station
        </Button>
      </div>

      <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white">
        <div className="relative w-full md:w-96 mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une ville ou une gare..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-slate-400">Chargement des stations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <div key={station.id} className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-slate-200">
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-900">{station.name}</h4>
                <p className="text-sm font-bold text-primary mb-2">{station.city}</p>
                <p className="text-xs text-slate-400 leading-relaxed truncate">{station.address || "Adresse non spécifiée"}</p>
              </div>
            ))}
            {stations.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40 italic">Aucune station enregistrée.</div>
            )}
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Ajouter une station"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateStation} className="px-8">Créer la station</Button>
          </>
        }
      >
        <div className="space-y-6">
          <Input 
            label="Nom de la gare / station" 
            placeholder="Gare Routière d'Agbalépédogan" 
            value={newStation.name}
            onChange={(e) => setNewStation({...newStation, name: e.target.value})}
          />
          <Input 
            label="Ville" 
            placeholder="Lomé" 
            value={newStation.city}
            onChange={(e) => setNewStation({...newStation, city: e.target.value})}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 ml-1">Adresse précise</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
              placeholder="Ex: Face au marché, Boulevard Eyadema"
              value={newStation.address}
              onChange={(e) => setNewStation({...newStation, address: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

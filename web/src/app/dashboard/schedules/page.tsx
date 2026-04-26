"use client";

import React, { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Bus as BusIcon, 
  MapPin, 
  User as UserIcon,
  Users,
  Clock,
  MoreVertical,
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Navigation
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import DriverSimulator from "@/components/DriverSimulator";

interface Schedule {
  id: string;
  departureTime: string;
  price: string;
  availableSeats: number;
  status: string;
  route: {
    departureStation: { name: string; city: string };
    arrivalStation: { name: string; city: string };
  };
  bus: {
    plateNumber: string;
    type: string;
  };
  driver?: {
    name: string;
  };
}

interface Route { id: string; departureStation: { city: string }; arrivalStation: { city: string } }
interface Bus { id: string; plateNumber: string; capacity: number }
interface Driver { id: string; name: string }

export default function SchedulesManagement() {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Data for creation
  const [routes, setRoutes] = useState<Route[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [activeSimulatorId, setActiveSimulatorId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    routeId: "",
    busId: "",
    driverId: "",
    departureTime: "",
    price: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedRes, routesRes, busesRes, driversRes] = await Promise.all([
        api.get("/schedules"), // L'API filtre déjà par compagnie pour les admins
        api.get("/routes"),
        api.get("/buses"),
        api.get("/drivers")
      ]);
      setSchedules(schedRes.data.data || []);
      setRoutes(routesRes.data.data || []);
      setBuses(busesRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (err) {
      console.error("Erreur chargement données", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async () => {
    try {
      // Trouver la capacité du bus sélectionné pour availableSeats
      const selectedBus = buses.find(b => b.id === formData.busId);
      
      await api.post("/schedules", {
        ...formData,
        availableSeats: selectedBus?.capacity || 50
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Erreur création trajet", err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Planning des Trajets</h2>
          <p className="text-foreground/40 font-medium">Gérez vos départs et affectations en temps réel.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Programmer un départ
        </Button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase">Aujourd'hui</p>
            <h4 className="text-xl font-black">12 Départs</h4>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white flex items-center gap-4">
          <div className="p-3 bg-success/10 rounded-2xl text-success">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase">Réservations</p>
            <h4 className="text-xl font-black">156 Passagers</h4>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-voyago rounded-3xl bg-white flex items-center gap-4">
          <div className="p-3 bg-accent/10 rounded-2xl text-accent">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase">Taux remplissage</p>
            <h4 className="text-xl font-black">78% Moyenne</h4>
          </div>
        </Card>
      </div>

      <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Rechercher un trajet..." 
              className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Input type="date" className="h-10 text-xs py-1" />
            <select className="bg-surface border border-border rounded-xl px-3 text-xs font-bold outline-none">
              <option>Tous les statuts</option>
              <option>Programmé</option>
              <option>En cours</option>
              <option>Terminé</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-foreground/40">Chargement du planning...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div key={schedule.id} className="group p-6 bg-surface/50 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-voyago transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Time & Date */}
                    <div className="md:w-32 text-center md:border-r border-border md:pr-6">
                      <p className="text-2xl font-black text-primary">
                        {new Date(schedule.departureTime).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                        {new Date(schedule.departureTime).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    {/* Route Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg">{schedule.route.departureStation.city}</span>
                        <ArrowRight className="w-4 h-4 text-primary/40" />
                        <span className="font-bold text-lg">{schedule.route.arrivalStation.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-foreground/40">
                        <span className="flex items-center gap-1"><BusIcon className="w-3.5 h-3.5" /> {schedule.bus.plateNumber} ({schedule.bus.type})</span>
                        <span className="flex items-center gap-1"><UserIcon className="w-3.5 h-3.5" /> {schedule.driver?.name || "Non assigné"}</span>
                      </div>
                    </div>

                    {/* Stats & Price */}
                    <div className="flex items-center gap-8 md:px-6">
                      <div className="text-center">
                        <p className="text-sm font-black text-foreground">{schedule.availableSeats}</p>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase">Places</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black text-primary">{parseInt(schedule.price).toLocaleString()} F</p>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase">Tarif</p>
                      </div>
                      <div>
                        <Badge variant={schedule.status === "scheduled" ? "info" : "success"}>
                          {schedule.status === "scheduled" ? "Programmé" : "En cours"}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl border border-border text-orange-500 hover:bg-orange-50"
                        onClick={() => {
                          setActiveSimulatorId(schedule.id);
                          setIsSimulatorOpen(true);
                        }}
                        title="Simuler GPS"
                      >
                        <Navigation className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl border border-border">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center opacity-40">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="font-bold">Aucun trajet programmé.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Create Schedule Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Programmer un nouveau départ"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateSchedule} className="px-8">Créer le trajet</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80 ml-1">Itinéraire</label>
            <select 
              className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.routeId}
              onChange={(e) => setFormData({...formData, routeId: e.target.value})}
            >
              <option value="">Sélectionner un itinéraire</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.departureStation.city} ↔ {r.arrivalStation.city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Bus assigné</label>
              <select 
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.busId}
                onChange={(e) => setFormData({...formData, busId: e.target.value})}
              >
                <option value="">Sélectionner un bus</option>
                {buses.map(b => (
                  <option key={b.id} value={b.id}>{b.plateNumber} ({b.capacity} pl.)</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Chauffeur</label>
              <select 
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.driverId}
                onChange={(e) => setFormData({...formData, driverId: e.target.value})}
              >
                <option value="">Sélectionner un chauffeur</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Date & Heure de départ" 
              type="datetime-local" 
              value={formData.departureTime}
              onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
            />
            <Input 
              label="Tarif (CFA)" 
              type="number" 
              placeholder="8500"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>

          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/60 leading-relaxed">
              Assurez-vous que le bus et le chauffeur sont disponibles à l'heure indiquée. Le trajet sera immédiatement visible par les passagers sur la plateforme.
            </p>
          </div>
        </div>
      </Modal>

      {/* Simulator Modal */}
      <Modal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        title="Simulation de trajet en direct"
      >
        {activeSimulatorId && (
          <DriverSimulator scheduleId={activeSimulatorId} />
        )}
        <p className="mt-6 text-[10px] text-foreground/40 text-center uppercase font-bold tracking-widest">
          Ce mode permet de tester le suivi GPS sans appareil réel.
        </p>
      </Modal>
    </div>
  );
}

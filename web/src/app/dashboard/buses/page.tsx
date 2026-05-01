"use client";

import React, { useEffect, useState } from "react";
import {
  Bus,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface BusType {
  id: string;
  plateNumber: string;
  capacity: number;
  type: string;
  status: "active" | "maintenance" | "inactive";
  seatsCount?: number;
}

export default function BusesManagement() {
  const { user } = useAuthStore();
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newBus, setNewBus] = useState({
    plateNumber: "",
    capacity: 50,
    type: "standard",
  });

  const fetchBuses = async () => {
    if (!user?.companyId) return;
    try {
      const response = await api.get(`/buses/company/${user.companyId}`);
      setBuses(response.data.data || []);
    } catch (err) {
      console.error("Erreur chargement bus", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.companyId]);

  const handleAddBus = async () => {
    if (!user?.companyId) return;
    if (!newBus.plateNumber.trim()) {
      setFormError("L'immatriculation est requise.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post(`/buses/company/${user.companyId}`, newBus);
      setIsModalOpen(false);
      setNewBus({ plateNumber: "", capacity: 50, type: "standard" });
      fetchBuses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Erreur lors de l'ajout du bus.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      await api.delete(`/buses/${busId}`);
      fetchBuses();
    } catch (err) {
      console.error("Erreur suppression bus", err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Gestion de la Flotte</h2>
          <p className="text-foreground/40 font-medium">Gérez vos véhicules et leur état de service.</p>
        </div>
        <Button
          onClick={() => { setFormError(null); setIsModalOpen(true); }}
          className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Ajouter un bus
        </Button>
      </div>

      <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Rechercher par immatriculation..."
              className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-foreground/40">Chargement de la flotte...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase text-foreground/40 border-b border-surface">
                  <th className="pb-4 pl-4">Immatriculation</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4 text-center">Capacité</th>
                  <th className="pb-4">Sièges</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {buses.length > 0 ? (
                  buses.map((bus) => (
                    <tr key={bus.id} className="border-b border-surface last:border-none group hover:bg-surface transition-colors">
                      <td className="py-6 pl-4 font-bold tracking-wider">{bus.plateNumber}</td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <Bus className="w-4 h-4 text-primary/40" />
                          <span className="capitalize">{bus.type}</span>
                        </div>
                      </td>
                      <td className="py-6 text-center">
                        <span className="bg-surface px-3 py-1 rounded-lg text-xs font-black">{bus.capacity} places</span>
                      </td>
                      <td className="py-6">
                        {bus.seatsCount && bus.seatsCount > 0 ? (
                          <span className="text-xs font-bold text-green-600">{bus.seatsCount} sièges</span>
                        ) : (
                          <span className="text-xs font-bold text-red-400">Aucun plan</span>
                        )}
                      </td>
                      <td className="py-6">
                        <Badge variant={bus.status === "active" ? "success" : bus.status === "maintenance" ? "warning" : "default"}>
                          {bus.status === "active" ? "Actif" : bus.status === "maintenance" ? "Maintenance" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="py-6 text-right pr-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-border">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg border border-border text-red-500 hover:bg-red-50"
                            onClick={() => handleDeleteBus(bus.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Bus className="w-12 h-12 mb-4" />
                        <p className="font-bold">Aucun bus enregistré.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un nouveau bus"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleAddBus} className="px-8" isLoading={submitting}>
              Confirmer l'ajout
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <Input
            label="Numéro d'immatriculation"
            placeholder="TG 4587 AX"
            value={newBus.plateNumber}
            onChange={(e) => setNewBus({ ...newBus, plateNumber: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80 ml-1">Type de bus</label>
              <select
                className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={newBus.type}
                onChange={(e) => setNewBus({ ...newBus, type: e.target.value })}
              >
                <option value="standard">Standard</option>
                <option value="vip">VIP</option>
                <option value="climatise">Climatisé</option>
              </select>
            </div>
            <Input
              label="Nombre de places"
              type="number"
              value={newBus.capacity}
              onChange={(e) => setNewBus({ ...newBus, capacity: parseInt(e.target.value) || 1 })}
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {formError}
            </div>
          )}

          <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/60 leading-relaxed">
              Le plan des sièges sera automatiquement généré lors de la création (configuration 2+allée+2).
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

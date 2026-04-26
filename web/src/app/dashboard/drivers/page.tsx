"use client";

import React, { useEffect, useState } from "react";
import { 
  User as UserIcon, 
  Plus, 
  Search, 
  Phone, 
  Award, 
  Calendar,
  Loader2,
  Trash2,
  Edit2,
  AlertCircle,
  FileText
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  experienceYears: number;
  isActive: boolean;
  photoUrl?: string;
}

export default function DriversManagement() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
    licenseExpiry: "",
    experienceYears: 0
  });

  const fetchDrivers = async () => {
    if (!user?.companyId) return;
    try {
      const response = await api.get(`/drivers/company/${user.companyId}`);
      setDrivers(response.data.data || []);
    } catch (err) {
      console.error("Erreur chargement chauffeurs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [user?.companyId]);

  const handleAddDriver = async () => {
    try {
      await api.post(`/drivers/company/${user?.companyId}`, {
        ...newDriver,
        experienceYears: Number(newDriver.experienceYears)
      });
      setIsModalOpen(false);
      fetchDrivers();
      setNewDriver({
        name: "",
        phone: "",
        licenseNumber: "",
        licenseExpiry: "",
        experienceYears: 0
      });
    } catch (err) {
      console.error("Erreur ajout chauffeur", err);
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Nos Chauffeurs</h2>
          <p className="text-foreground/40 font-medium">Gérez vos conducteurs et le suivi de leurs permis.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Ajouter un chauffeur
        </Button>
      </div>

      <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou permis..." 
              className="w-full bg-surface border border-border rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="default" className="cursor-pointer hover:bg-surface">Tous ({drivers.length})</Badge>
            <Badge variant="success" className="cursor-pointer hover:opacity-80">Actifs ({drivers.filter(d => d.isActive).length})</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-foreground/40">Chargement de l'équipe...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase text-foreground/40 border-b border-surface">
                  <th className="pb-4 pl-4">Chauffeur</th>
                  <th className="pb-4">Permis</th>
                  <th className="pb-4">Expérience</th>
                  <th className="pb-4">Expiration</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {drivers.length > 0 ? (
                  drivers.map((driver) => (
                    <tr key={driver.id} className="border-b border-surface last:border-none group hover:bg-surface transition-colors">
                      <td className="py-6 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {driver.photoUrl ? (
                              <img src={driver.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              driver.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold">{driver.name}</p>
                            <p className="text-xs text-foreground/40 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {driver.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary/40" />
                          <span className="font-mono">{driver.licenseNumber}</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-accent/40" />
                          <span>{driver.experienceYears} ans</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "flex items-center gap-1.5 text-xs font-bold",
                            isExpired(driver.licenseExpiry) ? "text-red-500" : "text-foreground/60"
                          )}>
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(driver.licenseExpiry).toLocaleDateString("fr-FR")}
                          </span>
                          {isExpired(driver.licenseExpiry) && (
                            <span className="text-[10px] text-red-500 font-black uppercase tracking-wider">Permis expiré !</span>
                          )}
                        </div>
                      </td>
                      <td className="py-6">
                        <Badge variant={driver.isActive ? "success" : "default"}>
                          {driver.isActive ? "En service" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="py-6 text-right pr-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-border">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-border text-red-500 hover:bg-red-50">
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
                        <UserIcon className="w-12 h-12 mb-4" />
                        <p className="font-bold">Aucun chauffeur enregistré.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Driver Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nouveau membre de l'équipe"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button onClick={handleAddDriver} className="px-8">Confirmer l'ajout</Button>
          </>
        }
      >
        <div className="space-y-6">
          <Input 
            label="Nom complet du chauffeur" 
            placeholder="Mawuli Koffi" 
            value={newDriver.name}
            onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
            leftIcon={<UserIcon className="w-4 h-4" />}
          />
          <Input 
            label="Numéro de téléphone" 
            placeholder="90 00 00 00" 
            value={newDriver.phone}
            onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Numéro du permis" 
              placeholder="12345/ABC/24" 
              value={newDriver.licenseNumber}
              onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
              leftIcon={<FileText className="w-4 h-4" />}
            />
            <Input 
              label="Années d'expérience" 
              type="number" 
              value={newDriver.experienceYears}
              onChange={(e) => setNewDriver({...newDriver, experienceYears: parseInt(e.target.value) || 0})}
              leftIcon={<Award className="w-4 h-4" />}
            />
          </div>
          <Input 
            label="Date d'expiration du permis" 
            type="date" 
            value={newDriver.licenseExpiry}
            onChange={(e) => setNewDriver({...newDriver, licenseExpiry: e.target.value})}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/60 leading-relaxed">
              Le chauffeur recevra automatiquement une invitation pour activer son compte mobile une fois enregistré.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

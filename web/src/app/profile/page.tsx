"use client";

import React, { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Save, 
  Loader2,
  Bus,
  ChevronLeft,
  Camera
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveTab] = useState<"general" | "security">("general");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await api.patch("/users/profile", profileData);
      updateUser(response.data.data);
      toast.success("Profil mis à jour avec succès !");
    } catch (err) {
      toast.error("Impossible de mettre à jour le profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Mot de passe modifié !");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Simple Header */}
      <nav className="bg-white border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground/60 hover:text-primary font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
             <div className="bg-primary p-1.5 rounded-lg"><Bus className="text-white w-4 h-4" /></div>
             <span className="font-black text-primary tracking-tight text-xl">Voyago</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-voyago border-none text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-24 bg-primary/5" />
               <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-surface border-4 border-white shadow-xl mx-auto flex items-center justify-center text-3xl font-black text-primary overflow-hidden group">
                     {profileData.avatarUrl ? (
                       <img src={profileData.avatarUrl} className="w-full h-full object-cover" alt="" />
                     ) : user?.name.charAt(0)}
                     <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-6 h-6" />
                     </button>
                  </div>
                  <h3 className="mt-4 text-xl font-black text-slate-900">{user?.name}</h3>
                  <Badge variant="info" className="mt-1 font-black text-[10px] uppercase tracking-wider">{user?.role}</Badge>
               </div>

               <div className="mt-10 space-y-2">
                  <button 
                    onClick={() => setActiveTab("general")}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all",
                      activeSection === "general" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-surface"
                    )}
                  >
                    <UserIcon className="w-5 h-5" /> Mon Profil
                  </button>
                  <button 
                    onClick={() => setActiveTab("security")}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all",
                      activeSection === "security" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-surface"
                    )}
                  >
                    <Lock className="w-5 h-5" /> Sécurité
                  </button>
               </div>
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
               <ShieldCheck className="w-8 h-8 text-primary mb-4" />
               <h4 className="font-black text-lg mb-2">Compte Sécurisé</h4>
               <p className="text-xs text-slate-400 leading-relaxed">Vos données personnelles sont cryptées et protégées selon les normes de sécurité en vigueur au Togo.</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8">
            {activeSection === "general" && (
              <Card className="p-10 border-none shadow-voyago rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Informations Personnelles</h2>
                
                <div className="space-y-6">
                  <Input 
                    label="Nom complet" 
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                  />
                  <Input 
                    label="Adresse Email" 
                    value={user?.email} 
                    disabled 
                    leftIcon={<Mail className="w-4 h-4" />}
                    className="opacity-60 bg-surface"
                  />
                  <Input 
                    label="Numéro de téléphone (+228)" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  
                  <div className="pt-8 flex justify-end border-t border-surface">
                    <Button 
                      className="rounded-2xl h-14 px-10 font-black shadow-lg shadow-primary/20"
                      isLoading={loading}
                      onClick={handleUpdateProfile}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      Sauvegarder les modifications
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="p-10 border-none shadow-voyago rounded-[2.5rem] bg-white animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-slate-900 mb-8">Sécurité du compte</h2>
                
                <div className="space-y-6">
                  <Input 
                    label="Mot de passe actuel" 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <div className="h-px bg-surface w-full" />
                  <Input 
                    label="Nouveau mot de passe" 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <Input 
                    label="Confirmer le nouveau mot de passe" 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  
                  <div className="pt-8 flex justify-end border-t border-surface">
                    <Button 
                      className="rounded-2xl h-14 px-10 font-black shadow-lg shadow-primary/20"
                      isLoading={loading}
                      onClick={handleChangePassword}
                      leftIcon={<Save className="w-5 h-5" />}
                    >
                      Mettre à jour le mot de passe
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

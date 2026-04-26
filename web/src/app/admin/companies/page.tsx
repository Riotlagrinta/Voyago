"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Mail,
  Phone
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";

interface Company {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  status: "pending" | "active" | "suspended";
  certified: boolean;
  createdAt: string;
  busesCount: number;
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.get("/companies");
      setCompanies(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateStatus = async (companyId: string, status: string) => {
    try {
      await api.put(`/companies/${companyId}`, { status });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCertification = async (companyId: string, current: boolean) => {
    try {
      await api.put(`/companies/${companyId}`, { certified: !current });
      fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Gestion des Partenaires</h2>
          <p className="text-slate-500 font-medium">Validez et certifiez les compagnies de transport du réseau.</p>
        </div>
      </div>

      <Card className="p-8 border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher une compagnie..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "all" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>Tous</button>
            <button onClick={() => setFilter("pending")} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "pending" ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>En attente ({companies.filter(c => c.status === "pending").length})</button>
            <button onClick={() => setFilter("active")} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", filter === "active" ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100")}>Actifs</button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium text-slate-400">Chargement des partenaires...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="pb-4 pl-4">Compagnie</th>
                  <th className="pb-4">Contact</th>
                  <th className="pb-4">Flotte</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4">Certification</th>
                  <th className="pb-4 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-slate-50 last:border-none group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-primary shadow-sm">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{company.name}</p>
                            <p className="text-xs text-slate-400">Inscrit le {new Date(company.createdAt).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="space-y-1">
                          <p className="text-xs flex items-center gap-1.5 text-slate-600 font-bold"><Mail className="w-3 h-3" /> {company.email || "N/A"}</p>
                          <p className="text-xs flex items-center gap-1.5 text-slate-600 font-bold"><Phone className="w-3 h-3" /> {company.phone || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-300" />
                          <span className="font-bold">{company.busesCount || 0} bus</span>
                        </div>
                      </td>
                      <td className="py-6">
                        <Badge variant={company.status === "active" ? "success" : company.status === "pending" ? "warning" : "error"}>
                          {company.status === "active" ? "Opérationnel" : company.status === "pending" ? "À valider" : "Suspendu"}
                        </Badge>
                      </td>
                      <td className="py-6">
                        <button 
                          onClick={() => handleToggleCertification(company.id, company.certified)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all",
                            company.certified 
                              ? "bg-primary/10 text-primary border border-primary/20" 
                              : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                          )}
                        >
                          <ShieldCheck className={cn("w-3.5 h-3.5", company.certified ? "fill-primary/20" : "")} />
                          {company.certified ? "Certifié" : "Non certifié"}
                        </button>
                      </td>
                      <td className="py-6 text-right pr-4">
                        <div className="flex justify-end gap-2">
                          {company.status === "pending" && (
                            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 rounded-xl px-4 h-9" onClick={() => handleUpdateStatus(company.id, "active")}>
                              Valider
                            </Button>
                          )}
                          {company.status === "active" && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl h-9" onClick={() => handleUpdateStatus(company.id, "suspended")}>
                              Suspendre
                            </Button>
                          )}
                          {company.status === "suspended" && (
                            <Button size="sm" className="bg-slate-900 rounded-xl px-4 h-9" onClick={() => handleUpdateStatus(company.id, "active")}>
                              Réactiver
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-200" onClick={() => window.open(`/compagnies/${company.slug}`, '_blank')}>
                            <Globe className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center opacity-40 font-bold italic">Aucune compagnie trouvée.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

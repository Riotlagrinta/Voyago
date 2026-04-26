"use client";

import React, { useEffect, useState } from "react";
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  Loader2,
  QrCode,
  Scan
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import AdminScanner from "@/components/AdminScanner";

const data = [
  { name: "Sodeitra", value: 400 },
  { name: "LK", value: 300 },
  { name: "Rakieta", value: 200 },
  { name: "Autres", value: 100 },
];

const COLORS = ["#50C9CE", "#71dbe0", "#a1e7ea", "#d0f3f5"];

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const response = await api.get("/companies");
        const companies = response.data.data;
        setStats({
          totalCompanies: companies.length,
          activeCompanies: companies.filter((c: any) => c.status === "active").length,
          pendingCompanies: companies.filter((c: any) => c.status === "pending").length,
          certifiedCompanies: companies.filter((c: any) => c.certified).length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalStats();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;

  return (
    <div className="space-y-10 pb-20">
      
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-1">Tableau de Bord 🛡️</h2>
          <p className="text-slate-500 font-medium">Gérez le réseau national de transport Voyago.</p>
        </div>
        <Button 
          onClick={() => setShowScanner(!showScanner)} 
          className={`h-14 px-8 rounded-2xl font-black transition-all shadow-xl ${showScanner ? 'bg-slate-900' : 'bg-primary shadow-primary/20'}`}
          leftIcon={showScanner ? <Users className="w-5 h-5" /> : <Scan className="w-5 h-5" />}
        >
          {showScanner ? "Fermer le Scanner" : "Scanner un Billet"}
        </Button>
      </div>

      {/* Zone de Scan Express */}
      {showScanner && (
        <div className="max-w-2xl mx-auto w-full animate-in slide-in-from-top-4 duration-500">
          <AdminScanner />
        </div>
      )}

      {/* Cartes de Stats Dynamiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Compagnies" 
          value={stats?.totalCompanies || "0"} 
          icon={<Building2 className="w-6 h-6" />} 
          trend="+2 ce mois"
          color="primary"
        />
        <StatCard 
          title="Utilisateurs" 
          value="12.4k" 
          icon={<Users className="w-6 h-6" />} 
          trend="+15%"
          color="amber"
        />
        <StatCard 
          title="Volume d'affaires" 
          value="4.8M F" 
          icon={<CreditCard className="w-6 h-6" />} 
          trend="+8%"
          color="emerald"
        />
        <StatCard 
          title="Taux de remplissage" 
          value="78%" 
          icon={<TrendingUp className="w-6 h-6" />} 
          trend="Optimal"
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique de Flux */}
        <Card className="lg:col-span-2 p-10 border-none shadow-voyago rounded-[2.5rem] bg-white h-[500px]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black">Activité des réservations</h3>
            <div className="flex gap-2">
              <Badge variant="info" className="bg-primary/10 text-primary border-none font-bold">Lomé</Badge>
              <Badge variant="info" className="bg-slate-100 text-slate-500 border-none font-bold">Kara</Badge>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: "Lun", res: 400 }, { name: "Mar", res: 550 }, { name: "Mer", res: 480 },
                { name: "Jeu", res: 700 }, { name: "Ven", res: 950 }, { name: "Sam", res: 1100 }, { name: "Dim", res: 850 }
              ]}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#50C9CE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#50C9CE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <Tooltip />
                <Area type="monotone" dataKey="res" stroke="#50C9CE" strokeWidth={4} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Part de Marché */}
        <Card className="p-10 border-none shadow-voyago rounded-[2.5rem] bg-white h-[500px] flex flex-col">
          <h3 className="text-xl font-black mb-10">Popularité des Compagnies</h3>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-8">
            {data.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-sm font-bold">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                  <span className="text-slate-500">{entry.name}</span>
                </div>
                <span className="text-slate-900">{entry.value} billets</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Dernières Alertes */}
      <Card className="p-10 border-none shadow-voyago rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="flex justify-between items-center mb-8 relative">
          <h3 className="text-xl font-black flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-primary" /> Alertes de Sécurité
          </h3>
          <Button variant="ghost" className="text-primary hover:text-white font-black">Tout marquer comme lu</Button>
        </div>
        
        <div className="space-y-4 relative">
          {[
            { msg: "3 échecs de paiement T-Money détectés", time: "12m ago", type: "error" },
            { msg: "Nouveau chauffeur à certifier pour LK Transport", time: "2h ago", type: "info" }
          ].map((alert, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-primary'}`} />
                <p className="font-bold text-sm">{alert.msg}</p>
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase">{alert.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  const colors: any = {
    primary: "border-primary text-primary bg-primary/5",
    amber: "border-amber-500 text-amber-600 bg-amber-50",
    emerald: "border-emerald-500 text-emerald-600 bg-emerald-50",
    indigo: "border-indigo-500 text-indigo-600 bg-indigo-50"
  };

  return (
    <Card className={`p-8 border-none shadow-voyago rounded-[2rem] bg-white border-l-8 ${colors[color].split(' ')[0]}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color].split(' ').slice(1).join(' ')}`}>
          {icon}
        </div>
        <Badge variant="info" className="bg-slate-100 text-slate-500 font-black text-[10px] tracking-widest">{trend}</Badge>
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase mb-1 tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900">{value}</h3>
      </div>
    </Card>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Bus,
  CreditCard,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface StatsData {
  totalRevenue: number;
  totalBookings: number;
  activeBuses: number;
  uniquePassengers: number;
  chartData: { name: string; total: number }[];
  popularRoutes: { route: string; count: number }[];
  recentBookings: {
    id: string;
    seatNumber: number;
    status: string;
    totalPrice: string;
    passengerName: string | null;
    createdAt: string;
    route: string;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmé",
  pending: "En attente",
  cancelled: "Annulé",
  completed: "Terminé",
};

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get(`/companies/${user?.companyId}/stats`);
        setStats(response.data.data);
      } catch (err) {
        console.error("Erreur stats", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.companyId) fetchStats();
    else setLoading(false);
  }, [user?.companyId]);

  const maxRouteCount = stats?.popularRoutes?.[0]?.count || 1;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Bonjour, {user?.name.split(' ')[0]} 👋</h2>
          <p className="text-foreground/40 font-medium">Voici les performances de votre compagnie aujourd'hui.</p>
        </div>
        <Badge variant="default" className="px-4 py-2 text-sm h-fit rounded-xl bg-primary/10 text-primary border-none">
          Période : 30 derniers jours
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-surface flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-success font-black text-xs">
                  <ArrowUpRight className="w-3 h-3" /> 30j
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Revenu Total</p>
                <h3 className="text-2xl font-black">{(stats?.totalRevenue ?? 0).toLocaleString("fr-FR")} F</h3>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-surface flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-success font-black text-xs">
                  <ArrowUpRight className="w-3 h-3" /> 30j
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Réservations</p>
                <h3 className="text-2xl font-black">{stats?.totalBookings ?? 0}</h3>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-surface flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Bus className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-foreground/40 font-black text-xs">
                  Actifs
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Bus Actifs</p>
                <h3 className="text-2xl font-black">{stats?.activeBuses ?? 0}</h3>
              </div>
            </Card>

            <Card className="p-6 border-none shadow-voyago rounded-3xl bg-surface flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-success font-black text-xs">
                  <ArrowUpRight className="w-3 h-3" /> 30j
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground/40 uppercase mb-1">Passagers Uniques</p>
                <h3 className="text-2xl font-black">{stats?.uniquePassengers ?? 0}</h3>
              </div>
            </Card>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 p-8 border-none shadow-voyago rounded-[2rem] bg-surface h-[450px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black">Évolution des Revenus</h3>
                <span className="text-xs font-bold bg-surface border border-border px-3 py-1.5 rounded-xl text-foreground/60">
                  7 derniers jours
                </span>
              </div>
              <div className="h-[300px] w-full">
                {chartsReady && stats?.chartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary-600)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-primary-600)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}}
                        tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : `${value}`}
                      />
                      <Tooltip
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow-voyago)', fontWeight: 'bold'}}
                        formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} F`, "Revenu"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-primary-600)"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-3xl bg-slate-50" />
                )}
              </div>
            </Card>

            <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-surface h-[450px]">
              <h3 className="text-xl font-black mb-8">Trajets Populaires</h3>
              {stats?.popularRoutes && stats.popularRoutes.length > 0 ? (
                <div className="space-y-6">
                  {stats.popularRoutes.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{item.route}</span>
                        <span className="text-foreground/40">{item.count} rés.</span>
                      </div>
                      <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", i === 0 ? "bg-primary" : i === 1 ? "bg-indigo-400" : i === 2 ? "bg-slate-400" : "bg-slate-300")}
                          style={{ width: `${(item.count / maxRouteCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground/40 text-center mt-8">Aucun trajet enregistré</p>
              )}
            </Card>
          </div>

          {/* Recent Bookings Table */}
          <Card className="p-8 border-none shadow-voyago rounded-[2rem] bg-surface overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black">Réservations Récentes</h3>
              <Button variant="ghost" className="text-primary font-bold">Voir tout</Button>
            </div>

            <div className="overflow-x-auto">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-black uppercase text-foreground/40 border-b border-surface">
                      <th className="pb-4 pl-4">Passager</th>
                      <th className="pb-4">Trajet</th>
                      <th className="pb-4">Siège</th>
                      <th className="pb-4">Prix</th>
                      <th className="pb-4">Statut</th>
                      <th className="pb-4 text-right pr-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {stats.recentBookings.map((b) => {
                      const initials = (b.passengerName || "??")
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      const relTime = new Date(b.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short",
                      });
                      return (
                        <tr key={b.id} className="border-b border-surface last:border-none group hover:bg-surface transition-colors">
                          <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">{initials}</div>
                              <span>{b.passengerName || "Passager"}</span>
                            </div>
                          </td>
                          <td className="py-4">{b.route}</td>
                          <td className="py-4"><Badge variant="default">#{b.seatNumber}</Badge></td>
                          <td className="py-4 font-bold text-primary">{parseInt(b.totalPrice).toLocaleString("fr-FR")} F</td>
                          <td className="py-4">
                            <Badge variant={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : b.status === "cancelled" ? "error" : "default"}>
                              {STATUS_LABELS[b.status] ?? b.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-right pr-4 text-foreground/40">{relTime}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-12 text-foreground/40 font-medium">Aucune réservation récente.</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

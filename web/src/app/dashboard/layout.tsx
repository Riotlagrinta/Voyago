"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Bus, 
  MapPin, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Calendar,
  ChevronRight,
  Menu,
  X,
  User as UserIcon
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/dashboard" },
  { icon: Calendar, label: "Planning & Trajets", href: "/dashboard/schedules" },
  { icon: Bus, label: "Ma Flotte", href: "/dashboard/buses" },
  { icon: Users, label: "Chauffeurs", href: "/dashboard/drivers" },
  { icon: BarChart3, label: "Ventes & Rapports", href: "/dashboard/reports" },
  { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== "company_admin" && user?.role !== "super_admin")) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== "company_admin" && user?.role !== "super_admin")) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-surface border-r border-border transition-all duration-300 flex flex-col z-50",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-surface">
          <div className="bg-primary p-2 rounded-xl shrink-0">
            <Bus className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <span className="text-2xl font-black tracking-tight text-primary">Voyago</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold",
                pathname === item.href 
                  ? "bg-primary text-white shadow-voyago" 
                  : "text-foreground/40 hover:bg-surface-100 hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.label}</span>}
              {isSidebarOpen && pathname === item.href && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-surface space-y-2">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-2xl bg-surface-100 border border-border",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
              {user?.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
                <p className="text-[10px] text-foreground/40 uppercase font-black tracking-wider">Admin Compagnie</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-error hover:bg-error/10 h-12 rounded-2xl"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isSidebarOpen && <span className="font-bold">Déconnexion</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-xl border border-border"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-black text-foreground">
              {menuItems.find(item => item.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-foreground/40 uppercase">Statut Plateforme</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-black text-success">OPÉRATIONNEL</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-8 bg-surface">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

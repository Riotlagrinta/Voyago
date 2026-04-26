"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Bus,
  AlertCircle
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/admin" },
  { icon: Building2, label: "Compagnies", href: "/admin/companies" },
  { icon: Users, label: "Utilisateurs", href: "/admin/users" },
  { icon: Settings, label: "Configuration", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "super_admin") {
      router.push("/login?redirect=/admin");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "super_admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white transition-all duration-300 flex flex-col z-50 shadow-2xl",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-primary p-2 rounded-xl shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <span className="text-xl font-black tracking-tight text-white block">VOYAGO</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Super Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto mt-4">
          {adminMenuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold",
                pathname === item.href 
                  ? "bg-primary text-white shadow-xl shadow-primary/40" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
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
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-700",
            !isSidebarOpen && "justify-center"
          )}>
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0 border border-primary/20">
              {user?.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Accès Racine</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12 rounded-2xl"
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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-xl border border-slate-200 text-slate-600"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <h1 className="text-xl font-black text-slate-900">
              {adminMenuItems.find(item => item.href === pathname)?.label || "Administration"}
            </h1>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700">3 demandes en attente</span>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

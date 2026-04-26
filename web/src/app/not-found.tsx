"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bus, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-8"
      >
        <div className="w-64 h-64 bg-primary/5 rounded-full flex items-center justify-center">
          <Bus className="w-32 h-32 text-primary/20" />
        </div>
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Bus className="w-20 h-20 text-primary shadow-2xl" />
        </motion.div>
      </motion.div>

      <h1 className="text-8xl font-black text-primary mb-4 tracking-tighter">404</h1>
      <h2 className="text-3xl font-black text-slate-900 mb-4">Oups ! Ce bus n'existe pas.</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
        Il semble que l'itinéraire que vous cherchez n'est plus desservi ou que vous ayez pris une mauvaise direction.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          className="rounded-2xl px-8 h-14 font-black"
          onClick={() => window.history.back()}
          variant="outline"
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Retourner en arrière
        </Button>
        <Link href="/">
          <Button 
            size="lg" 
            className="rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary/20"
            leftIcon={<Home className="w-5 h-5" />}
          >
            Accueil Voyago
          </Button>
        </Link>
      </div>
    </div>
  );
}

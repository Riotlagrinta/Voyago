"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ScanLine, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  User as UserIcon,
  Ticket,
  Armchair,
  Loader2
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ScannerPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialisation du scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (isProcessing || scanResult) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Pause du scanner visuellement (en ne traitant plus de nouveaux scans)
      const response = await api.post("/bookings/validate-qr", { qrCode: decodedText });
      
      if (response.data.success) {
        setScanResult(response.data.data);
        // Bip sonore optionnel ici
      } else {
        setError(response.data.message || "Ticket invalide");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de validation");
    } finally {
      setIsProcessing(false);
    }
  }

  function onScanFailure(error: any) {
    // On ignore les erreurs de lecture continues
  }

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header Mobile Dark */}
      <div className="px-6 py-6 flex items-center justify-between bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-black tracking-tight">Vérification Ticket</h1>
        <div className="w-10" />
      </div>

      <main className="max-w-md mx-auto px-6 pb-20">
        
        {/* Camera Container */}
        {!scanResult && !error && (
          <div className="relative mt-10">
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl -z-10" />
            <div className="rounded-[3rem] overflow-hidden border-4 border-white/10 bg-zinc-900 shadow-2xl relative">
              <div id="reader" className="w-full h-full"></div>
              
              {/* Overlay Animation */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scan-line" />
                </div>
              </div>
            </div>
            <p className="text-center text-white/40 text-xs font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
              <ScanLine className="w-4 h-4" /> Placez le QR Code dans le cadre
            </p>
          </div>
        )}

        {/* Success State */}
        {scanResult && (
          <div className="mt-10 animate-in fade-in zoom-in duration-300">
            <Card className="p-8 border-none bg-zinc-900 text-white rounded-[3rem] shadow-2xl">
              <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-center text-2xl font-black mb-2 text-success">Ticket Valide</h2>
              <p className="text-center text-white/40 text-sm mb-8">Passager autorisé à monter à bord.</p>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Passager</p>
                    <p className="font-bold">{scanResult.passengerName}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Armchair className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Siège</p>
                    <p className="font-bold text-xl">#{scanResult.seatNumber}</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={resetScanner} 
                className="w-full h-16 rounded-2xl mt-10 text-lg font-black bg-success hover:bg-success/90"
                leftIcon={<RefreshCcw className="w-5 h-5" />}
              >
                Scanner un autre
              </Button>
            </Card>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="p-8 border-none bg-zinc-900 text-white rounded-[3rem] shadow-2xl">
              <div className="w-20 h-20 bg-destructive/20 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-center text-2xl font-black mb-2 text-destructive">Erreur</h2>
              <p className="text-center text-white/40 text-sm mb-10">{error}</p>

              <Button 
                onClick={resetScanner} 
                variant="destructive"
                className="w-full h-16 rounded-2xl text-lg font-black"
                leftIcon={<RefreshCcw className="w-5 h-5" />}
              >
                Réessayer
              </Button>
            </Card>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">Vérification en cours...</p>
          </div>
        )}

      </main>
      
      {/* Styles inline pour l'animation du scanner */}
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan 2s ease-in-out infinite alternate;
        }
        #reader__status_span { display: none; }
        #reader__dashboard_section_csr button {
          background-color: #10B981 !important;
          color: white !important;
          border-radius: 0.75rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: bold !important;
          border: none !important;
          margin-top: 1rem !important;
        }
        #reader video {
          border-radius: 2rem !important;
        }
      `}</style>
    </div>
  );
}

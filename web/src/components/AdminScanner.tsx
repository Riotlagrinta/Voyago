'use client';

import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminScanner() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(decodedText: string) {
      // Pour éviter les scans multiples rapides
      if (loading) return;
      
      scanner.clear(); // Arrêter le scan pour traiter
      setLoading(true);
      setError(null);

      try {
        // Envoyer le token au backend pour validation
        const response = await api.post('/bookings/validate-qr', { qrCode: decodedText });
        setScanResult(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Billet invalide ou expiré.");
      } finally {
        setLoading(false);
      }
    }

    function onScanError(err: any) {
      // On ignore les erreurs de scan silencieuses (quand rien n'est trouvé)
    }

    return () => {
      scanner.clear().catch(e => console.error("Scanner cleanup error", e));
    };
  }, []);

  const resetScanner = () => {
    window.location.reload(); // Moyen simple de réinitialiser la lib
  };

  return (
    <div className="space-y-6">
      {!scanResult && !error && (
        <div className="bg-white rounded-3xl p-6 shadow-voyago overflow-hidden border-2 border-primary/10">
          <h2 className="text-xl font-black mb-6 text-center">Scanner un Billet</h2>
          <div id="reader" className="w-full"></div>
          <p className="text-center text-xs text-foreground/40 mt-4">Placez le QR Code du passager devant la caméra</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-voyago">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="font-bold">Vérification du billet...</p>
        </div>
      )}

      {scanResult && (
        <Card className="p-8 border-none shadow-voyago rounded-3xl bg-success/5 border-2 border-success/20 text-center animate-in zoom-in-95 duration-300">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
          <h2 className="text-2xl font-black text-success mb-2">BILLET VALIDE</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-success/10 space-y-3 mb-8">
            <p className="text-sm font-bold">Passager: <span className="text-foreground/40">{scanResult.passengerName}</span></p>
            <p className="text-sm font-bold">Siège: <span className="text-primary text-lg">#{scanResult.seatNumber}</span></p>
            <p className="text-xs text-foreground/20 font-mono">{scanResult.id.toUpperCase()}</p>
          </div>
          <Button className="w-full h-14 rounded-2xl bg-success hover:bg-success/90" onClick={resetScanner} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Scanner le suivant
          </Button>
        </Card>
      )}

      {error && (
        <Card className="p-8 border-none shadow-voyago rounded-3xl bg-red-50 border-2 border-red-200 text-center animate-in shake-1 duration-300">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-red-600 mb-2">BILLET REFUSÉ</h2>
          <p className="text-red-500 font-medium mb-8">{error}</p>
          <Button variant="outline" className="w-full h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-100" onClick={resetScanner}>
            Réessayer
          </Button>
        </Card>
      )}
    </div>
  );
}

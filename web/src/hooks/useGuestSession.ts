'use client';

import { useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

// Génère ou récupère un identifiant stable par navigateur
function getOrCreateFingerprint(): string {
  const key = 'voyago-guest-fp';
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, fp);
  }
  return fp;
}

export function useGuestSession() {
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) return;

    const fingerprint = getOrCreateFingerprint();

    api.post('/auth/guest', { fingerprint })
      .then(res => {
        const { user, token } = res.data.data;
        setAuth(user, token);
      })
      .catch(() => {
        // Silencieux — le site reste utilisable sans session guest
      });
  }, [isAuthenticated, setAuth]);
}

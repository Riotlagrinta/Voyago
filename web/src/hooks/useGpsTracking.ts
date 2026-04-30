"use client";

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const POLLING_INTERVAL = 30000; // 30 secondes

interface GpsTrackingState {
  position: [number, number];
  speed: number;
  lastUpdate: string | null;
  isConnected: boolean;
  isPolling: boolean;
}

export function useGpsTracking(scheduleId: string) {
  const [state, setState] = useState<GpsTrackingState>({
    position: [1.2254, 6.1256], // Lomé par défaut [longitude, latitude]
    speed: 0,
    lastUpdate: null,
    isConnected: false,
    isPolling: false
  });

  const socketRef = useRef<Socket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLocation = async () => {
    try {
      const response = await api.get(`/schedules/${scheduleId}/location`);
      if (response.data.success) {
        const { latitude, longitude, speed, recordedAt } = response.data.data;
        setState(prev => ({
          ...prev,
          position: [longitude, latitude],
          speed: speed || 0,
          lastUpdate: new Date(recordedAt).toLocaleTimeString(),
          isPolling: true
        }));
      }
    } catch (error) {
      console.error("[useGpsTracking] Polling error:", error);
    }
  };

  useEffect(() => {
    // 1. Initialiser Socket.io
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log("[useGpsTracking] Socket connecté");
      socket.emit('join_trip', scheduleId);
      setState(prev => ({ ...prev, isConnected: true, isPolling: false }));
      
      // Arrêter le polling si le socket revient
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    });

    socket.on('location_updated', (data: { latitude: number; longitude: number; speed: number; timestamp: string }) => {
      setState(prev => ({
        ...prev,
        position: [data.longitude, data.latitude],
        speed: data.speed || 0,
        lastUpdate: new Date(data.timestamp).toLocaleTimeString(),
        isPolling: false
      }));
    });

    socket.on('disconnect', () => {
      console.log("[useGpsTracking] Socket déconnecté, passage en mode polling");
      setState(prev => ({ ...prev, isConnected: false }));
      
      // Démarrer le polling
      if (!pollingRef.current) {
        fetchLocation(); // Premier appel immédiat
        pollingRef.current = setInterval(fetchLocation, POLLING_INTERVAL);
      }
    });

    // Nettoyage
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [scheduleId]);

  return state;
}

import { Server as SocketServer, Socket } from 'socket.io';
import { pool } from './prisma';

// Cache pour le throttling des écritures en base (Dernier enregistrement par scheduleId)
const lastSavedPositions = new Map<string, number>();
const DB_SAVE_INTERVAL = 30000; // 30 secondes

interface GpsData {
  scheduleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
}

export const setupSocketHandlers = (io: SocketServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connecté : ${socket.id}`);

    // Rejoindre la room d'un trajet (passagers et chauffeurs)
    socket.on('join_trip', (scheduleId: string) => {
      socket.join(`trip_${scheduleId}`);
      console.log(`📍 Socket ${socket.id} rejoint le trajet ${scheduleId}`);
    });

    // Mise à jour de la position GPS (envoyé par le chauffeur)
    socket.on('update_location', async (data: GpsData) => {
      const { scheduleId, latitude, longitude, speed = 0 } = data;

      if (!scheduleId || !latitude || !longitude) return;

      // 1. Diffusion immédiate à tous les passagers qui suivent ce trajet
      io.to(`trip_${scheduleId}`).emit('location_updated', {
        latitude,
        longitude,
        speed,
        timestamp: new Date().toISOString()
      });

      // 2. Throttling : Enregistrement en base toutes les X secondes seulement
      const now = Date.now();
      const lastSave = lastSavedPositions.get(scheduleId) || 0;

      if (now - lastSave > DB_SAVE_INTERVAL) {
        try {
          // Utilisation de SQL brut pour PostGIS (ST_SetSRID)
          await pool.query(
            `INSERT INTO gps_positions (schedule_id, location, speed, recorded_at)
             VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, NOW())`,
            [scheduleId, longitude, latitude, speed]
          );
          
          lastSavedPositions.set(scheduleId, now);
          // console.log(`💾 Position GPS archivée pour le trajet ${scheduleId}`);
        } catch (error) {
          console.error(`❌ Erreur archivage GPS :`, error);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client déconnecté : ${socket.id}`);
    });
  });
};

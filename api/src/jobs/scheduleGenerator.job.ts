import cron from 'node-cron';
import { prisma } from '../lib/prisma';

/**
 * Ce service génère automatiquement les trajets pour le "targetDate" (ex: J+7)
 * en se basant sur les trajets d'un "sourceDate" (ex: Aujourd'hui).
 * Cela permet de maintenir un cycle hebdomadaire continu.
 */
export const generateRollingSchedules = async (daysAhead = 7) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);

    console.log(`\n🕒 [CRON] Lancement de la génération des trajets pour le ${targetDate.toLocaleDateString()}`);

    // On utilise la journée d'aujourd'hui comme modèle (source)
    const sourceStart = new Date(today);
    const sourceEnd = new Date(today);
    sourceEnd.setHours(23, 59, 59, 999);

    const templateSchedules = await prisma.schedule.findMany({
      where: {
        departureTime: {
          gte: sourceStart,
          lte: sourceEnd,
        },
        status: { not: 'cancelled' },
      },
    });

    if (templateSchedules.length === 0) {
      console.log(`⚠️ [CRON] Aucun trajet modèle trouvé pour aujourd'hui. Impossible de cloner pour J+${daysAhead}.`);
      return;
    }

    let createdCount = 0;

    for (const template of templateSchedules) {
      // Calculer la nouvelle heure de départ
      const originalDeparture = new Date(template.departureTime);
      const newDeparture = new Date(targetDate);
      newDeparture.setHours(
        originalDeparture.getHours(),
        originalDeparture.getMinutes(),
        originalDeparture.getSeconds(),
        originalDeparture.getMilliseconds()
      );

      // Calculer la nouvelle heure d'arrivée (si elle existe)
      let newArrival = null;
      if (template.arrivalTime) {
        const originalArrival = new Date(template.arrivalTime);
        newArrival = new Date(targetDate);
        newArrival.setHours(
          originalArrival.getHours(),
          originalArrival.getMinutes(),
          originalArrival.getSeconds(),
          originalArrival.getMilliseconds()
        );
        // Gérer le cas où l'arrivée est le lendemain du départ
        if (originalArrival.getDate() !== originalDeparture.getDate()) {
          newArrival.setDate(newArrival.getDate() + 1);
        }
      }

      // Vérifier que le trajet n'existe pas déjà pour éviter les doublons
      const existing = await prisma.schedule.findFirst({
        where: {
          routeId: template.routeId,
          busId: template.busId,
          departureTime: newDeparture,
        },
      });

      if (!existing) {
        await prisma.schedule.create({
          data: {
            routeId: template.routeId,
            busId: template.busId,
            driverId: template.driverId,
            departureTime: newDeparture,
            arrivalTime: newArrival,
            price: template.price,
            availableSeats: template.availableSeats,
            status: 'scheduled',
          },
        });
        createdCount++;
      }
    }

    console.log(`✅ [CRON] ${createdCount} nouveaux trajets générés pour le ${targetDate.toLocaleDateString()}.`);
  } catch (error) {
    console.error('❌ [CRON] Erreur lors de la génération des trajets :', error);
  }
};

// Planification de la tâche : Tous les jours à minuit (00:00)
export const initScheduleCron = () => {
  console.log('🕒 [CRON] Job de génération automatique des trajets initialisé (00:00).');
  
  cron.schedule('0 0 * * *', () => {
    // Génère les trajets pour dans exactement 7 jours
    generateRollingSchedules(7);
  });
};

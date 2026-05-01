import { prisma } from './prisma';

/**
 * Libère les sièges dont le lock de 15 minutes a expiré sans paiement.
 * Appelé au démarrage puis toutes les 5 minutes.
 */
export async function releaseExpiredLocks(): Promise<void> {
  try {
    const expired = await prisma.booking.findMany({
      where: {
        status: 'pending',
        lockedUntil: { lt: new Date() },
      },
      select: { id: true, scheduleId: true },
    });

    if (expired.length === 0) return;

    const scheduleGroups = new Map<string, number>();
    for (const b of expired) {
      scheduleGroups.set(b.scheduleId, (scheduleGroups.get(b.scheduleId) ?? 0) + 1);
    }

    await prisma.$transaction([
      prisma.booking.updateMany({
        where: { id: { in: expired.map(b => b.id) } },
        data: { status: 'cancelled' },
      }),
      ...Array.from(scheduleGroups.entries()).map(([scheduleId, count]) =>
        prisma.schedule.update({
          where: { id: scheduleId },
          data: { availableSeats: { increment: count } },
        })
      ),
    ]);

    console.info(`[LockCleaner] ${expired.length} réservation(s) expirée(s) annulée(s).`);
  } catch (error) {
    console.error('[LockCleaner] Erreur lors du nettoyage des locks:', error);
  }
}

export function startLockCleaner(intervalMs = 5 * 60 * 1000): NodeJS.Timeout {
  releaseExpiredLocks();
  return setInterval(releaseExpiredLocks, intervalMs);
}

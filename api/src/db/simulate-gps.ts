import { prisma } from "../lib/prisma";

async function simulateMovement() {
  console.log("🚀 Lancement de la simulation GPS en temps réel (Lomé -> Kara)...");

  try {
    const schedule = await prisma.schedule.findFirst({
      where: { status: "ongoing" },
      orderBy: { createdAt: 'desc' }
    });

    if (!schedule) {
      console.error("❌ Aucun trajet 'ongoing' trouvé. Lance d'abord le seed-gps.ts");
      return;
    }

    console.log(`📡 Simulation pour le trajet ID: ${schedule.id}`);

    let currentLng = 1.2144;
    let currentLat = 6.1375;
    const targetLng = 1.1911;
    const targetLat = 9.5489;

    const steps = 50;
    const lngStep = (targetLng - currentLng) / steps;
    const latStep = (targetLat - currentLat) / steps;

    for (let i = 0; i <= steps; i++) {
      currentLng += lngStep + (Math.random() - 0.5) * 0.001;
      currentLat += latStep + (Math.random() - 0.5) * 0.001;
      
      const speed = 70 + Math.random() * 20;

      await prisma.$executeRaw`
        INSERT INTO gps_positions (id, schedule_id, location, speed, recorded_at)
        VALUES (
          gen_random_uuid(),
          ${schedule.id}::uuid,
          ST_SetSRID(ST_MakePoint(${currentLng}, ${currentLat}), 4326)::geography,
          ${speed},
          NOW()
        )
      `;

      console.log(`📍 Étape ${i}/${steps} : Position [${currentLng.toFixed(4)}, ${currentLat.toFixed(4)}] - Vitesse: ${speed.toFixed(1)} km/h`);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log("✅ Simulation terminée !");

  } catch (error) {
    console.error("❌ Erreur pendant la simulation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateMovement();

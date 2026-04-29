import { prisma } from "../lib/prisma";

async function seedRealGpsData() {
  console.log("🌱 Début de l'injection des données GPS réelles...");

  try {
    // 1. On cherche ou crée une compagnie de test
    const company = await prisma.company.findFirst() || await prisma.company.create({
      data: {
        name: "Voyago Express",
        slug: "voyago-express-" + Date.now(),
        status: "active",
        certified: true,
        admin: {
          connectOrCreate: {
            where: { email: "admin@voyago.tg" },
            create: {
              name: "Admin Voyago",
              email: "admin@voyago.tg",
              passwordHash: "$2a$10$abcdef", 
              role: "company_admin"
            }
          }
        }
      }
    });

    // 2. On crée deux gares réelles au Togo
    const lome = await prisma.station.create({
      data: {
        name: "Gare de Lomé (Agbalépédogan)",
        city: "Lomé",
        address: "Boulevard de la Kara",
      }
    });

    const kara = await prisma.station.create({
      data: {
        name: "Gare Centrale de Kara",
        city: "Kara",
        address: "Centre ville",
      }
    });

    // Activation de PostGIS pour les gares
    await prisma.$executeRaw`UPDATE stations SET location = ST_SetSRID(ST_MakePoint(1.2144, 6.1375), 4326)::geography WHERE id = ${lome.id}::uuid`;
    await prisma.$executeRaw`UPDATE stations SET location = ST_SetSRID(ST_MakePoint(1.1911, 9.5489), 4326)::geography WHERE id = ${kara.id}::uuid`;

    // 3. Création du bus et du trajet
    const bus = await prisma.bus.create({
      data: {
        plateNumber: "TG-2026-" + Math.floor(Math.random() * 1000),
        type: "vip",
        capacity: 45,
        companyId: company.id
      }
    });

    const route = await prisma.route.create({
      data: {
        companyId: company.id,
        departureStationId: lome.id,
        arrivalStationId: kara.id,
        distanceKm: 410,
        durationMin: 420
      }
    });

    const schedule = await prisma.schedule.create({
      data: {
        routeId: route.id,
        busId: bus.id,
        departureTime: new Date(),
        price: 8500,
        availableSeats: 45,
        status: "ongoing"
      }
    });

    // 4. Injection d'une position GPS en cours de route (ex: près d'Atakpamé)
    await prisma.$executeRaw`
      INSERT INTO gps_positions (id, schedule_id, location, speed, recorded_at)
      VALUES (
        gen_random_uuid(),
        ${schedule.id}::uuid,
        ST_SetSRID(ST_MakePoint(1.1303, 7.5256), 4326)::geography,
        75.5,
        NOW()
      )
    `;

    console.log("✅ Données de test injectées avec succès !");
    console.log(`🔗 Trajet actif créé ID: ${schedule.id}`);

  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRealGpsData();

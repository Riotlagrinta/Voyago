import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database with real Togolese data...");

  // ─── Super Admin ───────────────────────────────────────────────────────────
  const superAdminHash = await bcrypt.hash("Admin@Voyago2026!", 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@voyago.tg" },
    update: {},
    create: {
      name: "Admin Voyago",
      email: "admin@voyago.tg",
      phone: "+22891000000",
      passwordHash: superAdminHash,
      role: "super_admin",
      emailVerified: true,
    },
  });
  console.log("✅ Super admin:", superAdmin.email);

  // ─── Company Admin ─────────────────────────────────────────────────────────
  const companyAdminHash = await bcrypt.hash("STIF@2026!", 10);
  const companyAdmin = await prisma.user.upsert({
    where: { email: "stif@voyago.tg" },
    update: {},
    create: {
      name: "Directeur STIF",
      email: "stif@voyago.tg",
      phone: "+22892000001",
      passwordHash: companyAdminHash,
      role: "company_admin",
      emailVerified: true,
    },
  });
  console.log("✅ Company admin:", companyAdmin.email);

  // ─── Company 1 : STIF ─────────────────────────────────────────────────────
  const stif = await prisma.company.upsert({
    where: { slug: "stif-togo" },
    update: {},
    create: {
      name: "STIF - Société de Transport Interurbain du Faso",
      slug: "stif-togo",
      description:
        "Leader du transport interurbain au Togo depuis 1987. Liaisons confortables entre Lomé, Atakpamé, Sokodé, Kara et Dapaong.",
      phone: "+22822201500",
      email: "contact@stif-togo.tg",
      address: "Gare de Lomé, Boulevard de la Kara",
      city: "Lomé",
      themeColor: "#1E40AF",
      slogan: "Votre confort, notre priorité",
      status: "active",
      certified: true,
      adminId: companyAdmin.id,
    },
  });
  console.log("✅ Company:", stif.name);

  // ─── Company 2 : Trans Togo ────────────────────────────────────────────────
  const transTogoAdmin = await prisma.user.upsert({
    where: { email: "transtogo@voyago.tg" },
    update: {},
    create: {
      name: "Directeur Trans Togo",
      email: "transtogo@voyago.tg",
      phone: "+22893000001",
      passwordHash: await bcrypt.hash("TransTogo@2026!", 10),
      role: "company_admin",
      emailVerified: true,
    },
  });

  const transTogo = await prisma.company.upsert({
    where: { slug: "trans-togo" },
    update: {},
    create: {
      name: "Trans Togo Express",
      slug: "trans-togo",
      description:
        "Compagnie moderne avec des bus climatisés VIP pour vos trajets longue distance au Togo.",
      phone: "+22822305500",
      email: "contact@transtogo.tg",
      address: "Gare Routière de Lomé",
      city: "Lomé",
      themeColor: "#059669",
      slogan: "Rapidité et confort garantis",
      status: "active",
      certified: true,
      adminId: transTogoAdmin.id,
    },
  });
  console.log("✅ Company:", transTogo.name);

  // ─── Test Passenger ────────────────────────────────────────────────────────
  const passengerHash = await bcrypt.hash("Passager@2026!", 10);
  await prisma.user.upsert({
    where: { email: "koffi@example.com" },
    update: {},
    create: {
      name: "Koffi Mensah",
      email: "koffi@example.com",
      phone: "+22890123456",
      passwordHash: passengerHash,
      role: "passenger",
      emailVerified: true,
    },
  });
  console.log("✅ Test passenger: koffi@example.com");

  // ─── Stations ─────────────────────────────────────────────────────────────
  const stationData = [
    { name: "Gare d'Agbalépédogan", city: "Lomé", address: "Boulevard de la Kara, Agbalépédogan", lng: 1.2144, lat: 6.1375 },
    { name: "Gare de Kégué", city: "Lomé", address: "Route de Kégué", lng: 1.2312, lat: 6.1689 },
    { name: "Gare d'Atakpamé", city: "Atakpamé", address: "Quartier Défalé, Atakpamé", lng: 1.1235, lat: 7.5333 },
    { name: "Gare de Sokodé", city: "Sokodé", address: "Centre ville Sokodé", lng: 1.1333, lat: 8.9833 },
    { name: "Gare Centrale de Kara", city: "Kara", address: "Avenue de la Paix, Kara", lng: 1.1860, lat: 9.5511 },
    { name: "Gare de Dapaong", city: "Dapaong", address: "Quartier Mandouri, Dapaong", lng: 0.2046, lat: 10.8627 },
    { name: "Gare de Kpalimé", city: "Kpalimé", address: "Quartier Sanguéra, Kpalimé", lng: 0.6296, lat: 6.9007 },
    { name: "Gare de Tsévié", city: "Tsévié", address: "Route Nationale 1, Tsévié", lng: 1.2143, lat: 6.4261 },
  ];

  const stations: Record<string, { id: string; city: string }> = {};

  for (const s of stationData) {
    const existing = await prisma.station.findFirst({ where: { name: s.name } });
    let station;
    if (existing) {
      station = existing;
    } else {
      station = await prisma.station.create({
        data: { name: s.name, city: s.city, address: s.address },
      });
      await prisma.$executeRaw`
        UPDATE stations
        SET location = ST_SetSRID(ST_MakePoint(${s.lng}, ${s.lat}), 4326)::geography
        WHERE id = ${station.id}::uuid
      `;
    }
    stations[s.city] = { id: station.id, city: s.city };
    console.log(`  📍 Station: ${s.name} (${s.city})`);
  }

  // When there are two stations in the same city (Lomé), keep both but alias by name
  const lomeAgbale = await prisma.station.findFirst({ where: { name: "Gare d'Agbalépédogan" } });
  const lomeKegue = await prisma.station.findFirst({ where: { name: "Gare de Kégué" } });

  // ─── STIF Buses ────────────────────────────────────────────────────────────
  const stifBuses = [
    { plateNumber: "TG 1234 AX", type: "standard" as const, capacity: 60 },
    { plateNumber: "TG 5678 BX", type: "vip" as const, capacity: 44 },
    { plateNumber: "TG 9012 CX", type: "climatise" as const, capacity: 50 },
  ];

  const stifBusIds: string[] = [];
  for (const b of stifBuses) {
    const existing = await prisma.bus.findUnique({ where: { plateNumber: b.plateNumber } });
    let bus;
    if (existing) {
      bus = existing;
    } else {
      bus = await prisma.bus.create({
        data: { ...b, companyId: stif.id },
      });
      // Initialize seats
      const seats = [];
      const cols = [0, 1, 3, 4]; // 2 + aisle + 2
      const rows = Math.ceil(b.capacity / 4);
      let seatNum = 1;
      for (let row = 0; row < rows && seatNum <= b.capacity; row++) {
        for (const col of cols) {
          if (seatNum > b.capacity) break;
          seats.push({
            busId: bus.id,
            seatNumber: seatNum++,
            rowPos: row,
            colPos: col,
            type: (b.type === "vip" ? "vip" : "standard") as "standard" | "vip",
          });
        }
      }
      await prisma.seat.createMany({ data: seats });
    }
    stifBusIds.push(bus.id);
    console.log(`  🚌 Bus: ${b.plateNumber}`);
  }

  // ─── Trans Togo Buses ──────────────────────────────────────────────────────
  const transTogoBus = await prisma.bus.upsert({
    where: { plateNumber: "TG 4400 VX" },
    update: {},
    create: { plateNumber: "TG 4400 VX", type: "vip", capacity: 44, companyId: transTogo.id },
  });
  const seatsExist = await prisma.seat.count({ where: { busId: transTogoBus.id } });
  if (seatsExist === 0) {
    const seats = [];
    const cols = [0, 1, 3, 4];
    let seatNum = 1;
    for (let row = 0; row < 11; row++) {
      for (const col of cols) {
        if (seatNum > 44) break;
        seats.push({ busId: transTogoBus.id, seatNumber: seatNum++, rowPos: row, colPos: col, type: "vip" as const });
      }
    }
    await prisma.seat.createMany({ data: seats });
  }

  // ─── STIF Drivers ─────────────────────────────────────────────────────────
  const stifDrivers = [
    { name: "Ayité Komlan", phone: "+22890111111", licenseNumber: "TG/PL/2019/0045", licenseExpiry: "2027-06-30", experienceYears: 12 },
    { name: "Mawuli Dossou", phone: "+22891222222", licenseNumber: "TG/PL/2020/0112", licenseExpiry: "2028-03-15", experienceYears: 8 },
  ];

  const stifDriverIds: string[] = [];
  for (const d of stifDrivers) {
    const existing = await prisma.driver.findUnique({ where: { licenseNumber: d.licenseNumber } });
    let driver;
    if (existing) {
      driver = existing;
    } else {
      driver = await prisma.driver.create({
        data: { ...d, licenseExpiry: new Date(d.licenseExpiry), companyId: stif.id },
      });
    }
    stifDriverIds.push(driver.id);
    console.log(`  👤 Driver: ${d.name}`);
  }

  // ─── STIF Routes ──────────────────────────────────────────────────────────
  const routeDefs = [
    {
      depCity: "Lomé", arrCity: "Kara",
      depStation: lomeAgbale!,
      arrStation: stations["Kara"],
      distanceKm: 420, durationMin: 420,
    },
    {
      depCity: "Lomé", arrCity: "Atakpamé",
      depStation: lomeAgbale!,
      arrStation: stations["Atakpamé"],
      distanceKm: 160, durationMin: 150,
    },
    {
      depCity: "Lomé", arrCity: "Kpalimé",
      depStation: lomeKegue!,
      arrStation: stations["Kpalimé"],
      distanceKm: 120, durationMin: 120,
    },
    {
      depCity: "Kara", arrCity: "Dapaong",
      depStation: stations["Kara"],
      arrStation: stations["Dapaong"],
      distanceKm: 250, durationMin: 210,
    },
  ];

  const stifRouteIds: string[] = [];
  for (const r of routeDefs) {
    const existing = await prisma.route.findFirst({
      where: { companyId: stif.id, departureStationId: r.depStation.id, arrivalStationId: r.arrStation.id },
    });
    let route;
    if (existing) {
      route = existing;
    } else {
      route = await prisma.route.create({
        data: {
          companyId: stif.id,
          departureStationId: r.depStation.id,
          arrivalStationId: r.arrStation.id,
          distanceKm: r.distanceKm,
          durationMin: r.durationMin,
        },
      });
    }
    stifRouteIds.push(route.id);
    console.log(`  🛣️  Route: ${r.depCity} → ${r.arrCity}`);
  }

  // ─── Trans Togo Route ──────────────────────────────────────────────────────
  const transTogoRoute = await prisma.route.findFirst({
    where: { companyId: transTogo.id, departureStationId: lomeAgbale!.id, arrivalStationId: stations["Kara"].id },
  }) || await prisma.route.create({
    data: {
      companyId: transTogo.id,
      departureStationId: lomeAgbale!.id,
      arrivalStationId: stations["Kara"].id,
      distanceKm: 420,
      durationMin: 380,
    },
  });

  // ─── Schedules ─────────────────────────────────────────────────────────────
  // Generate schedules for the next 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduleDefs = [
    // STIF Lomé→Kara (morning & evening)
    { routeId: stifRouteIds[0], busId: stifBusIds[0], driverId: stifDriverIds[0], hourOffset: 6, minuteOffset: 0, price: 8500 },
    { routeId: stifRouteIds[0], busId: stifBusIds[1], driverId: stifDriverIds[1], hourOffset: 15, minuteOffset: 0, price: 10000 },
    // STIF Lomé→Atakpamé
    { routeId: stifRouteIds[1], busId: stifBusIds[2], driverId: stifDriverIds[0], hourOffset: 7, minuteOffset: 30, price: 4500 },
    { routeId: stifRouteIds[1], busId: stifBusIds[0], driverId: stifDriverIds[1], hourOffset: 13, minuteOffset: 0, price: 4500 },
    // STIF Lomé→Kpalimé
    { routeId: stifRouteIds[2], busId: stifBusIds[1], driverId: stifDriverIds[0], hourOffset: 8, minuteOffset: 0, price: 3500 },
    // STIF Kara→Dapaong
    { routeId: stifRouteIds[3], busId: stifBusIds[2], driverId: stifDriverIds[1], hourOffset: 9, minuteOffset: 0, price: 6000 },
    // Trans Togo Lomé→Kara VIP
    { routeId: transTogoRoute.id, busId: transTogoBus.id, driverId: null, hourOffset: 7, minuteOffset: 0, price: 12000 },
  ];

  let schedulesCreated = 0;
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    for (const s of scheduleDefs) {
      const departure = new Date(today);
      departure.setDate(today.getDate() + dayOffset);
      departure.setHours(s.hourOffset, s.minuteOffset, 0, 0);

      const busCapacity = await prisma.bus.findUnique({ where: { id: s.busId }, select: { capacity: true } });
      const availableSeats = busCapacity?.capacity || 50;

      await prisma.schedule.create({
        data: {
          routeId: s.routeId,
          busId: s.busId,
          driverId: s.driverId,
          departureTime: departure,
          price: s.price,
          availableSeats,
          status: "scheduled",
        },
      });
      schedulesCreated++;
    }
  }
  console.log(`✅ ${schedulesCreated} horaires créés (7 jours × ${scheduleDefs.length} départs)`);

  console.log("\n🎉 Seed terminé avec succès !");
  console.log("\n📋 Comptes de test :");
  console.log("  Super admin : admin@voyago.tg / Admin@Voyago2026!");
  console.log("  Admin STIF  : stif@voyago.tg / STIF@2026!");
  console.log("  Passager    : koffi@example.com / Passager@2026!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

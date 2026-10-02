import { PrismaClient, Role, Brand, VehicleType, Temperature, VehicleStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Starting database seed process...');

  const dataDir = path.resolve(__dirname, '../../data');
  const outletsCsvPath = path.join(dataDir, 'outlets.csv');
  const vehiclesCsvPath = path.join(dataDir, 'vehicles.csv');

  // 1. Seed Outlets
  if (fs.existsSync(outletsCsvPath)) {
    const outletsContent = fs.readFileSync(outletsCsvPath, 'utf-8');
    const lines = outletsContent.split('\n').filter((l) => l.trim().length > 0);
    const headers = lines[0].split(',').map((h) => h.trim());

    console.info(`📦 Seeding ${lines.length - 1} outlets from ${outletsCsvPath}...`);
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < headers.length) continue;

      const [
        outlet_id,
        brand,
        district,
        depot,
        dock_type,
        parking_constraint,
        mall_window,
        window_open_time,
        window_close_time,
      ] = parts;

      await prisma.outlet.upsert({
        where: { outletId: outlet_id },
        update: {},
        create: {
          outletId: outlet_id,
          name: `Waypoint ${brand} - ${district} (${outlet_id})`,
          brand: brand as Brand,
          district: district,
          depotId: depot,
          dockType: dock_type || 'street',
          parkingConstraint: parking_constraint || 'normal',
          mallWindow: mall_window || null,
          windowOpenTime: window_open_time || '05:00',
          windowCloseTime: window_close_time || '07:30',
        },
      });
    }
  }

  // 2. Seed Vehicles
  if (fs.existsSync(vehiclesCsvPath)) {
    const vehiclesContent = fs.readFileSync(vehiclesCsvPath, 'utf-8');
    const lines = vehiclesContent.split('\n').filter((l) => l.trim().length > 0);

    console.info(`🚚 Seeding ${lines.length - 1} fleet vehicles from ${vehiclesCsvPath}...`);
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim());
      if (parts.length < 9) continue;

      const [
        vehicle_id,
        type,
        temp,
        weight_cap_kg,
        volume_cap_m3,
        fuel_type,
        km_per_l,
        weekly_fuel_quota_l,
        depot,
      ] = parts;

      await prisma.vehicle.upsert({
        where: { vehicleId: vehicle_id },
        update: {},
        create: {
          vehicleId: vehicle_id,
          type: type as VehicleType,
          temp: temp as Temperature,
          weightCapKg: parseFloat(weight_cap_kg),
          volumeCapM3: parseFloat(volume_cap_m3),
          fuelType: fuel_type || 'diesel',
          kmPerL: parseFloat(km_per_l),
          weeklyFuelQuotaL: parseFloat(weekly_fuel_quota_l),
          depotId: depot,
          status: VehicleStatus.available,
        },
      });
    }
  }

  // 3. Seed 4 Official Demo User Accounts
  console.info('👥 Seeding default demo accounts...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('REDACTED', salt);

  const demoUsers = [
    { email: 'dispatcher@waypoint.test', name: 'Nimal Perera', role: Role.dispatcher },
    { email: 'loader@waypoint.test', name: 'Priya Fernando', role: Role.loader },
    { email: 'driver@waypoint.test', name: 'Kamal Silva', role: Role.driver },
    { email: 'store@waypoint.test', name: 'Anjali Jayawardena', role: Role.store, outletId: 'OUT001' },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: passwordHash,
        outletId: user.outletId || null,
      },
    });
  }

  console.info('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

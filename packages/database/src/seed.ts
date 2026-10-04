import {
  PrismaClient,
  Role,
  Brand,
  VehicleType,
  Temperature,
  VehicleStatus,
  OrderStatus,
  PlanningBucket,
} from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('Starting Waypoint database seed process...');

  const candidateDirs = [
    process.env.DATA_DIR,
    path.resolve(__dirname, '../../../data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '../../data'),
  ].filter(Boolean) as string[];

  const dataDir =
    candidateDirs.find((dir) => fs.existsSync(path.join(dir, 'outlets.csv'))) ||
    path.resolve(process.cwd(), 'data');

  const outletsCsvPath = path.join(dataDir, 'outlets.csv');
  const vehiclesCsvPath = path.join(dataDir, 'vehicles.csv');

  console.info(`Resolved data directory: ${dataDir}`);

  // Seed Outlets
  if (!fs.existsSync(outletsCsvPath)) {
    console.error(`ERROR: outlets.csv not found at ${outletsCsvPath}`);
    process.exit(1);
  }

  const outletsContent = fs.readFileSync(outletsCsvPath, 'utf-8');
  const outletLines = outletsContent.split('\n').filter((l) => l.trim().length > 0);
  const outletHeaders = outletLines[0].split(',').map((h) => h.trim());

  console.info(`Seeding ${outletLines.length - 1} outlets from ${outletsCsvPath}...`);
  for (let i = 1; i < outletLines.length; i++) {
    const parts = outletLines[i].split(',').map((p) => p.trim());
    if (parts.length < outletHeaders.length) continue;

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
      update: {
        name: `Waypoint ${brand} ${district} (${outlet_id})`,
        brand: brand as Brand,
        district: district,
        depotId: depot,
        dockType: dock_type || 'street',
        parkingConstraint: parking_constraint || 'normal',
        mallWindow: mall_window || null,
        windowOpenTime: window_open_time || '05:00',
        windowCloseTime: window_close_time || '07:30',
      },
      create: {
        outletId: outlet_id,
        name: `Waypoint ${brand} ${district} (${outlet_id})`,
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

  // Seed Vehicles
  if (!fs.existsSync(vehiclesCsvPath)) {
    console.error(`ERROR: vehicles.csv not found at ${vehiclesCsvPath}`);
    process.exit(1);
  }

  const vehiclesContent = fs.readFileSync(vehiclesCsvPath, 'utf-8');
  const vehicleLines = vehiclesContent.split('\n').filter((l) => l.trim().length > 0);

  console.info(`Seeding ${vehicleLines.length - 1} fleet vehicles from ${vehiclesCsvPath}...`);
  for (let i = 1; i < vehicleLines.length; i++) {
    const parts = vehicleLines[i].split(',').map((p) => p.trim());
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
      update: {
        type: type as VehicleType,
        temp: temp as Temperature,
        weightCapKg: parseFloat(weight_cap_kg),
        volumeCapM3: parseFloat(volume_cap_m3),
        fuelType: fuel_type || 'diesel',
        kmPerL: parseFloat(km_per_l),
        weeklyFuelQuotaL: parseFloat(weekly_fuel_quota_l),
        depotId: depot,
      },
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

  // Seed Default Demo Accounts
  console.info('Seeding default authenticated accounts...');
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD || 'REDACTED';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const demoUsers = [
    { email: 'dispatcher@waypoint.test', name: 'Nimal Perera', role: Role.dispatcher },
    { email: 'loader@waypoint.test', name: 'Priya Fernando', role: Role.loader },
    { email: 'driver@waypoint.test', name: 'Kamal Silva', role: Role.driver },
    { email: 'store@waypoint.test', name: 'Anjali Jayawardena', role: Role.store, outletId: 'OUT001' },
    // Also support corporate domain emails
    { email: 'nimal.perera@waypoint.lk', name: 'Nimal Perera', role: Role.dispatcher },
    { email: 'priya.fernando@waypoint.lk', name: 'Priya Fernando', role: Role.loader },
    { email: 'kamal.silva@waypoint.lk', name: 'Kamal Silva', role: Role.driver },
    { email: 'anjali.jayawardena@waypoint.lk', name: 'Anjali Jayawardena', role: Role.store, outletId: 'OUT001' },
    // Also support submission knurdz.org domain emails
    { email: 'dispatcher@waypoint.knurdz.org', name: 'Nimal Perera', role: Role.dispatcher },
    { email: 'loader@waypoint.knurdz.org', name: 'Priya Fernando', role: Role.loader },
    { email: 'driver@waypoint.knurdz.org', name: 'Kamal Silva', role: Role.driver },
    { email: 'store@waypoint.knurdz.org', name: 'Anjali Jayawardena', role: Role.store, outletId: 'OUT001' },
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash: passwordHash,
        outletId: user.outletId || null,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash: passwordHash,
        outletId: user.outletId || null,
      },
    });
  }

  // Seed Initial Operational Orders
  console.info('Seeding initial operational orders...');
  const initialOrders = [
    {
      orderId: 'ORD_92301',
      outletId: 'OUT001',
      tempRequirement: Temperature.reefer,
      weightKg: 380,
      volumeM3: 1.4,
      sku: 'REEF-DAIRY-01',
      description: 'Chilled Milk & Fresh Curd',
      units: 38,
    },
    {
      orderId: 'ORD_92302',
      outletId: 'OUT002',
      tempRequirement: Temperature.ambient,
      weightKg: 520,
      volumeM3: 2.1,
      sku: 'AMB-DRY-01',
      description: 'Bread loaves, organic rice',
      units: 52,
    },
    {
      orderId: 'ORD_92303',
      outletId: 'OUT003',
      tempRequirement: Temperature.reefer,
      weightKg: 440,
      volumeM3: 1.8,
      sku: 'REEF-PROD-02',
      description: 'Yogurt, Butter Totes & Ice Cream',
      units: 44,
    },
    {
      orderId: 'ORD_92304',
      outletId: 'OUT015',
      tempRequirement: Temperature.ambient,
      weightKg: 780,
      volumeM3: 3.2,
      sku: 'AMB-DRY-02',
      description: 'Apparel & Packed Textiles',
      units: 78,
    },
    {
      orderId: 'ORD_92305',
      outletId: 'OUT016',
      tempRequirement: Temperature.ambient,
      weightKg: 920,
      volumeM3: 4.0,
      sku: 'AMB-DRY-03',
      description: 'Fashion Display Stock & Accessories',
      units: 92,
    },
    {
      orderId: 'ORD_92306',
      outletId: 'OUT022',
      tempRequirement: Temperature.ambient,
      weightKg: 640,
      volumeM3: 2.6,
      sku: 'AMB-TECH-01',
      description: 'Consumer Electronics & Accessories',
      units: 64,
    },
    {
      orderId: 'ORD_92307',
      outletId: 'OUT040',
      tempRequirement: Temperature.reefer,
      weightKg: 850,
      volumeM3: 3.4,
      sku: 'REEF-POULTRY-01',
      description: 'Chilled Poultry & Seafood Packs',
      units: 85,
    },
    {
      orderId: 'ORD_92308',
      outletId: 'OUT041',
      tempRequirement: Temperature.ambient,
      weightKg: 680,
      volumeM3: 2.7,
      sku: 'AMB-DRY-04',
      description: 'Dry Groceries & Household Essentials',
      units: 68,
    },
    {
      orderId: 'ORD_92309',
      outletId: 'OUT076',
      tempRequirement: Temperature.reefer,
      weightKg: 490,
      volumeM3: 1.9,
      sku: 'REEF-PROD-03',
      description: 'Highland Dairy & Fresh Vegetables',
      units: 49,
    },
    {
      orderId: 'ORD_92310',
      outletId: 'OUT077',
      tempRequirement: Temperature.ambient,
      weightKg: 410,
      volumeM3: 1.6,
      sku: 'AMB-DRY-05',
      description: 'Fresh Baked Goods & Flours',
      units: 41,
    },
    {
      orderId: 'ORD_92311',
      outletId: 'OUT084',
      tempRequirement: Temperature.ambient,
      weightKg: 810,
      volumeM3: 3.5,
      sku: 'AMB-STYLE-02',
      description: 'Retail Apparel Crates',
      units: 81,
    },
    {
      orderId: 'ORD_92312',
      outletId: 'OUT093',
      tempRequirement: Temperature.ambient,
      weightKg: 530,
      volumeM3: 2.2,
      sku: 'AMB-TECH-02',
      description: 'Smart Hardware & Components',
      units: 53,
    },
  ];

  const today = new Date();
  const orderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const o of initialOrders) {
    await prisma.order.upsert({
      where: { orderId: o.orderId },
      update: {
        outletId: o.outletId,
        orderDate,
        tempRequirement: o.tempRequirement,
        orderUnits: o.units,
        weightKg: o.weightKg,
        volumeM3: o.volumeM3,
        status: OrderStatus.confirmed,
        planningBucket: PlanningBucket.next_day,
      },
      create: {
        orderId: o.orderId,
        outletId: o.outletId,
        orderDate,
        tempRequirement: o.tempRequirement,
        orderUnits: o.units,
        weightKg: o.weightKg,
        volumeM3: o.volumeM3,
        status: OrderStatus.confirmed,
        planningBucket: PlanningBucket.next_day,
        items: {
          create: [
            {
              sku: o.sku,
              description: o.description,
              quantity: o.units,
              weightKg: o.weightKg,
              volumeM3: o.volumeM3,
            },
          ],
        },
      },
    });
  }

  console.info('Database seed completed successfully!');

}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

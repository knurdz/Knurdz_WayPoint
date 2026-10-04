export * from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

import bcrypt from 'bcryptjs';

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export const INITIAL_ORDERS_SEED = [
  {
    orderId: 'ORD_92301',
    outletId: 'OUT001',
    tempRequirement: 'reefer' as const,
    weightKg: 380,
    volumeM3: 1.4,
    sku: 'REEF-DAIRY-01',
    description: 'Chilled Milk & Fresh Curd',
    units: 38,
  },
  {
    orderId: 'ORD_92302',
    outletId: 'OUT002',
    tempRequirement: 'ambient' as const,
    weightKg: 520,
    volumeM3: 2.1,
    sku: 'AMB-DRY-01',
    description: 'Bread loaves, organic rice',
    units: 52,
  },
  {
    orderId: 'ORD_92303',
    outletId: 'OUT003',
    tempRequirement: 'reefer' as const,
    weightKg: 440,
    volumeM3: 1.8,
    sku: 'REEF-PROD-02',
    description: 'Yogurt, Butter Totes & Ice Cream',
    units: 44,
  },
  {
    orderId: 'ORD_92304',
    outletId: 'OUT015',
    tempRequirement: 'ambient' as const,
    weightKg: 780,
    volumeM3: 3.2,
    sku: 'AMB-DRY-02',
    description: 'Apparel & Packed Textiles',
    units: 78,
  },
  {
    orderId: 'ORD_92305',
    outletId: 'OUT016',
    tempRequirement: 'ambient' as const,
    weightKg: 920,
    volumeM3: 4.0,
    sku: 'AMB-DRY-03',
    description: 'Fashion Display Stock & Accessories',
    units: 92,
  },
  {
    orderId: 'ORD_92306',
    outletId: 'OUT022',
    tempRequirement: 'ambient' as const,
    weightKg: 640,
    volumeM3: 2.6,
    sku: 'AMB-TECH-01',
    description: 'Consumer Electronics & Accessories',
    units: 64,
  },
  {
    orderId: 'ORD_92307',
    outletId: 'OUT040',
    tempRequirement: 'reefer' as const,
    weightKg: 850,
    volumeM3: 3.4,
    sku: 'REEF-POULTRY-01',
    description: 'Chilled Poultry & Seafood Packs',
    units: 85,
  },
  {
    orderId: 'ORD_92308',
    outletId: 'OUT041',
    tempRequirement: 'ambient' as const,
    weightKg: 680,
    volumeM3: 2.7,
    sku: 'AMB-DRY-04',
    description: 'Dry Groceries & Household Essentials',
    units: 68,
  },
  {
    orderId: 'ORD_92309',
    outletId: 'OUT076',
    tempRequirement: 'reefer' as const,
    weightKg: 490,
    volumeM3: 1.9,
    sku: 'REEF-PROD-03',
    description: 'Highland Dairy & Fresh Vegetables',
    units: 49,
  },
  {
    orderId: 'ORD_92310',
    outletId: 'OUT077',
    tempRequirement: 'ambient' as const,
    weightKg: 410,
    volumeM3: 1.6,
    sku: 'AMB-DRY-05',
    description: 'Fresh Baked Goods & Flours',
    units: 41,
  },
  {
    orderId: 'ORD_92311',
    outletId: 'OUT084',
    tempRequirement: 'ambient' as const,
    weightKg: 810,
    volumeM3: 3.5,
    sku: 'AMB-STYLE-02',
    description: 'Retail Apparel Crates',
    units: 81,
  },
  {
    orderId: 'ORD_92312',
    outletId: 'OUT093',
    tempRequirement: 'ambient' as const,
    weightKg: 530,
    volumeM3: 2.2,
    sku: 'AMB-TECH-02',
    description: 'Smart Hardware & Components',
    units: 53,
  },
];

export async function ensureInitialOrders(): Promise<void> {
  try {
    const count = await prisma.order.count();
    if (count > 0) return;

    const today = new Date();
    const orderDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    for (const o of INITIAL_ORDERS_SEED) {
      await prisma.order.upsert({
        where: { orderId: o.orderId },
        update: {},
        create: {
          orderId: o.orderId,
          outletId: o.outletId,
          orderDate,
          tempRequirement: o.tempRequirement,
          orderUnits: o.units,
          weightKg: o.weightKg,
          volumeM3: o.volumeM3,
          status: 'confirmed',
          planningBucket: 'next_day',
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
  } catch (err) {
    console.error('Failed to ensure initial orders in database:', err);
  }
}



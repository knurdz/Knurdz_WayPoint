import { NextResponse } from "next/server";

interface RolledOrder {
  id: string;
  orderNumber: string;
  outletName: string;
  receivedTime: string;
  nextRunDate: string;
  weightKg: number;
  isColdChain: boolean;
}

let cutoffLocked = false;
let lockedAtTimestamp: string | null = null;

function getNextRunDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

const sampleRolledOrders: RolledOrder[] = [
  {
    id: "ord_roll_1",
    orderNumber: "ORD009901",
    outletName: "OUT014 Fresh Kandy",
    receivedTime: "16:12 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 280,
    isColdChain: true,
  },
  {
    id: "ord_roll_2",
    orderNumber: "ORD009902",
    outletName: "OUT022 Style Colombo",
    receivedTime: "16:28 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 450,
    isColdChain: false,
  },
  {
    id: "ord_roll_3",
    orderNumber: "ORD009903",
    outletName: "OUT001 Fresh Galle Rd",
    receivedTime: "16:45 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 310,
    isColdChain: true,
  },
  {
    id: "ord_roll_4",
    orderNumber: "ORD009904",
    outletName: "OUT008 Metro Negombo",
    receivedTime: "16:52 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 620,
    isColdChain: false,
  },
  {
    id: "ord_roll_5",
    orderNumber: "ORD009905",
    outletName: "OUT019 Express Kurunegala",
    receivedTime: "17:05 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 190,
    isColdChain: true,
  },
  {
    id: "ord_roll_6",
    orderNumber: "ORD009906",
    outletName: "OUT005 Central Gampaha",
    receivedTime: "17:15 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 520,
    isColdChain: false,
  },
  {
    id: "ord_roll_7",
    orderNumber: "ORD009907",
    outletName: "OUT011 Coastal Matara",
    receivedTime: "17:30 SLST",
    nextRunDate: getNextRunDateStr(),
    weightKg: 340,
    isColdChain: true,
  },
];

export async function GET() {
  const dynamicNextRun = getNextRunDateStr();
  const orders = sampleRolledOrders.map((o) => ({
    ...o,
    nextRunDate: dynamicNextRun,
  }));

  return NextResponse.json({
    cutoffTime: "16:00:00",
    timezone: "SLST (UTC+05:30)",
    isLocked: cutoffLocked,
    lockedAt: lockedAtTimestamp,
    totalLateToday: orders.length,
    orders,
  });
}

export async function POST() {
  cutoffLocked = true;
  lockedAtTimestamp = new Date().toISOString();
  return NextResponse.json({
    success: true,
    message: "Cutoff mutex lock acquired and rollover snapshot finalized",
    lockedAt: lockedAtTimestamp,
    totalRolled: sampleRolledOrders.length,
  });
}

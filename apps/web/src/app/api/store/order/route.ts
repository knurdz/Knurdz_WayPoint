import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ambientProduct, ambientWeight, chilledProduct, chilledWeight, outletCode } = body;

    // Check current time against 16:00 SLST cutoff
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const slstMillis = utcMillis + 5.5 * 3600000;
    const slstDate = new Date(slstMillis);

    const isLate = slstDate.getHours() >= 16;
    const orderTimestamp = slstDate.toLocaleTimeString("en-US", { hour12: false });

    const generatedOrders = [
      {
        orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        outletCode: outletCode || "OUT001",
        cargoType: "Ambient",
        product: ambientProduct || "Bread loaves, organic rice",
        weightKg: Number(ambientWeight) || 2100,
        isLate,
        scheduledRun: isLate ? "Next Run (Rolled)" : "Today 05:00 Run",
        status: isLate ? "ROLLED_LATE" : "CONFIRMED",
      },
      {
        orderId: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        outletCode: outletCode || "OUT001",
        cargoType: "Chilled",
        product: chilledProduct || "Dairy cases, curd, ice cream",
        weightKg: Number(chilledWeight) || 4850,
        isLate,
        scheduledRun: isLate ? "Next Run (Rolled)" : "Today 05:00 Run",
        status: isLate ? "ROLLED_LATE" : "CONFIRMED",
      },
    ];

    return NextResponse.json({
      success: true,
      timestamp: orderTimestamp,
      isPastCutoff: isLate,
      orders: generatedOrders,
      message: isLate
        ? "Orders accepted after 16:00 SLST cutoff and queued for next run"
        : "Both orders confirmed for scheduled morning dispatch",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to place store orders", details: String(error) },
      { status: 500 }
    );
  }
}

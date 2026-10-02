import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, qtyShort, productLine, notes, decision } = body;

    const incidentId = `INC_${Math.floor(8800 + Math.random() * 1000)}`;

    return NextResponse.json({
      success: true,
      incidentId,
      tripId: tripId || "VEH037 Trip 1",
      qtyShort: Number(qtyShort) || 3,
      productLine: productLine || "Chilled Greek Yogurt 500g",
      notes: notes || "Missing from pick face",
      decision: decision || "Leave now · 3 cases short",
      dispatchedTo: "Dispatcher Exception Inbox",
      timestamp: new Date().toISOString(),
      message: `Shortfall alert ${incidentId} transmitted to Dispatcher Triage Desk`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit shortfall report", details: String(error) },
      { status: 500 }
    );
  }
}

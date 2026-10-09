import { NextResponse } from "next/server";
import { loaderShortfallSchema, validateRequestBody } from "@/lib/api_schemas";
import { addIncident } from "@/lib/incidentsStore";

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, loaderShortfallSchema);
    if (!validation.success) {
      return validation.response;
    }
    const { tripId, qtyShort, productLine, notes, decision } = validation.data;

    const incidentId = `INC_${Math.floor(8800 + Math.random() * 1000)}`;

    addIncident({
      id: incidentId.toLowerCase(),
      code: incidentId,
      type: "shortfall",
      severity: "high",
      title: `Dock Shortfall: ${tripId || "VEH037"} short ${qtyShort || 3} units`,
      description: `${productLine || "Chilled cases"}: ${notes || "Damaged/missing cases at staging"}. Decision: ${decision || "Gate alert dispatched"}.`,
      vehicleId: tripId ? tripId.split(" ")[0] : "VEH037",
      routeId: "R025229",
      outletId: "OUT001",
      status: "OPEN",
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) + " SLST",
    });

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

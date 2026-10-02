import { NextResponse } from "next/server";

interface ExceptionIncident {
  id: string;
  code: string;
  type: "shortfall" | "sync" | "window";
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  vehicleId: string;
  routeId: string;
  outletId: string;
  status: "OPEN" | "RESOLVED";
  resolutionNote?: string;
  timestamp: string;
}

let sampleIncidents: ExceptionIncident[] = [
  {
    id: "inc_01",
    code: "INC_8821",
    type: "shortfall",
    severity: "critical",
    title: "Dock Shortfall: Peliyagoda Bay 04 missing 2 reefer totes",
    description: "VEH004 gate hold active. Manifest lists 18 totes, loader scanned only 16. Departure blocked.",
    vehicleId: "VEH004",
    routeId: "R025210",
    outletId: "OUT001",
    status: "OPEN",
    timestamp: "06:15 SLST",
  },
  {
    id: "inc_02",
    code: "INC_8822",
    type: "sync",
    severity: "high",
    title: "Sync Conflict: Kandy hill country blackout delivery POD dispute",
    description: "Server deferred OUT003 at 06:00 AM while Kamal Silva delivered offline at 06:35 AM with valid proof of delivery.",
    vehicleId: "VEH037",
    routeId: "R025229",
    outletId: "OUT003",
    status: "OPEN",
    timestamp: "06:40 SLST",
  },
  {
    id: "inc_03",
    code: "INC_8823",
    type: "window",
    severity: "medium",
    title: "Window Risk: Mall dock ETA breach projected for Duplication Rd",
    description: "Traffic congestion on Baseline Rd adds 22 minutes. ETA now 07:42 AM against 07:30 AM mall access cutoff.",
    vehicleId: "VEH002",
    routeId: "R025214",
    outletId: "OUT002",
    status: "OPEN",
    timestamp: "06:55 SLST",
  },
];

export async function GET() {
  const openCount = sampleIncidents.filter((i) => i.status === "OPEN").length;
  const gateHolds = sampleIncidents.filter((i) => i.type === "shortfall" && i.status === "OPEN").length;
  const syncConflicts = sampleIncidents.filter((i) => i.type === "sync" && i.status === "OPEN").length;
  const windowRisks = sampleIncidents.filter((i) => i.type === "window" && i.status === "OPEN").length;

  return NextResponse.json({
    kpis: {
      openIncidents: openCount,
      gateHolds,
      syncConflicts,
      windowRisks,
    },
    incidents: sampleIncidents,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { incidentId, action, note } = body;

    const incident = sampleIncidents.find((i) => i.id === incidentId);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    incident.status = "RESOLVED";
    incident.resolutionNote = `${action}: ${note || "Resolved by dispatcher"}`;

    return NextResponse.json({
      success: true,
      message: `Incident ${incident.code} resolved successfully`,
      incident,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to resolve incident", details: String(error) },
      { status: 500 }
    );
  }
}

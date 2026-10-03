import { NextResponse } from 'next/server';
import { GLOBAL_INCIDENTS } from '@/lib/incidentsStore';

export async function GET() {
  const openCount = GLOBAL_INCIDENTS.filter((i) => i.status === 'OPEN').length;
  const gateHolds = GLOBAL_INCIDENTS.filter((i) => i.type === 'shortfall' && i.status === 'OPEN').length;
  const syncConflicts = GLOBAL_INCIDENTS.filter((i) => i.type === 'sync' && i.status === 'OPEN').length;
  const windowRisks = GLOBAL_INCIDENTS.filter((i) => i.type === 'window' && i.status === 'OPEN').length;

  return NextResponse.json({
    kpis: {
      openIncidents: openCount,
      gateHolds,
      syncConflicts,
      windowRisks,
    },
    incidents: GLOBAL_INCIDENTS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { incidentId, action, note } = body;

    const incident = GLOBAL_INCIDENTS.find((i) => i.id === incidentId);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    incident.status = 'RESOLVED';
    incident.resolutionNote = `${action}: ${note || 'Resolved by dispatcher'}`;

    return NextResponse.json({
      success: true,
      message: `Incident ${incident.code} resolved successfully`,
      incident,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to resolve incident', details: String(error) },
      { status: 500 }
    );
  }
}

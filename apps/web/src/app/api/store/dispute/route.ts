import { NextResponse } from 'next/server';
import { addIncident } from '@/lib/incidentsStore';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { deliveryCode, missingCount, damagedNotes, signatureSigned } = body;

    const count = Number(missingCount) || 1;
    const cleanCode = (deliveryCode && typeof deliveryCode === 'string') ? deliveryCode.trim() : 'DEL_88390';
    const disputeId = `DSP_${Math.floor(1000 + Math.random() * 9000)}`;

    addIncident({
      id: `inc_${Date.now()}`,
      code: `INC_${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'shortfall',
      severity: count > 2 ? 'critical' : 'high',
      title: `Store Dispute: Delivery ${cleanCode} reported ${count} damaged or missing units`,
      description: `Store filed electronic receipt discrepancy. Notes: ${damagedNotes || 'Damaged upon delivery'}. Requires dispatcher intervention.`,
      vehicleId: 'VEH004',
      routeId: 'R025210',
      outletId: 'OUT001',
      status: 'OPEN',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' SLST',
    });

    const disputeRecord = {
      disputeId,
      deliveryCode: cleanCode,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString(),
      missingCount: count,
      damagedNotes: damagedNotes || 'None',
      signatureSigned: Boolean(signatureSigned),
      message: 'Dispute ticket generated and routed to Dispatcher Incident Desk',
    };

    return NextResponse.json(disputeRecord);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit POD dispute', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import {
  IN_MEMORY_FLEET_TELEMETRY,
  IN_MEMORY_COLD_CHAIN_ALERTS,
  resetTelemetryState,
} from '@/lib/agent_tools';
import { addIncident, resetChaosIncidents } from '@/lib/incidentsStore';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const scenario = body.scenario || 'cold_chain';

    if (scenario === 'cold_chain') {
      if (IN_MEMORY_FLEET_TELEMETRY.TRK002) {
        IN_MEMORY_FLEET_TELEMETRY.TRK002.chilledTempC = 6.2;
        IN_MEMORY_FLEET_TELEMETRY.TRK002.coldChainStatus = 'breach';
        IN_MEMORY_FLEET_TELEMETRY.TRK002.location = 'Kandy Road Kadawatha (Compressor Stall)';
      }

      const existingAlert = IN_MEMORY_COLD_CHAIN_ALERTS.find((a) => a.vehicleId === 'TRK002');
      if (!existingAlert) {
        IN_MEMORY_COLD_CHAIN_ALERTS.unshift({
          vehicleId: 'TRK002',
          driver: 'Kamal Perera',
          outletId: 'OUT003',
          outletName: 'Peradeniya Store',
          compartment: 'chilled',
          currentTempC: 6.2,
          thresholdC: 4.0,
          severity: 'critical',
          durationMinutes: 12,
          status: 'Reefer compressor stalled at Kadawatha. Temperature at 6.2 degrees Celsius breaching Rule 02.',
        });
      }

      addIncident({
        id: 'inc_chaos_cold',
        code: 'INC_9901',
        type: 'shortfall',
        severity: 'critical',
        title: 'Critical Cold Chain Breach: TRK002 compressor stalled at 6.2 C',
        description: 'Immediate reefer compressor trip detected on chassis TRK002 carrying 10 chilled dairy crates. Perishable threshold R02 breached.',
        vehicleId: 'TRK002',
        routeId: 'R025218',
        outletId: 'OUT003',
        status: 'OPEN',
        timestamp: '10:14 SLST',
      });

      const elapsedMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        scenario: 'cold_chain',
        title: 'Cold Chain Thermal Emergency Triggered',
        vehicleId: 'TRK002',
        incidentCode: 'INC_9901',
        temperatureC: 6.2,
        elapsedMs,
        spokenAlert: 'Attention Dispatcher: Critical temperature deviation on vehicle TRK002 at Kadawatha. Chilled compartment is at 6.2 degrees Celsius.',
      });
    }

    if (scenario === 'breakdown') {
      if (IN_MEMORY_FLEET_TELEMETRY.TRK001) {
        IN_MEMORY_FLEET_TELEMETRY.TRK001.speedKmH = 0;
        IN_MEMORY_FLEET_TELEMETRY.TRK001.location = 'Peliyagoda Expressway km 14 (Mechanical Breakdown)';
      }

      addIncident({
        id: 'inc_chaos_breakdown',
        code: 'INC_9902',
        type: 'shortfall',
        severity: 'critical',
        title: 'Expressway Breakdown: TRK001 transmission failure',
        description: 'TRK001 immobilized on E02 expressway. 5 pending drops reallocated to backup chassis VAN001 within Rule 01 payload limits.',
        vehicleId: 'TRK001',
        routeId: 'R025212',
        outletId: 'OUT005',
        status: 'OPEN',
        timestamp: '10:15 SLST',
      });

      const elapsedMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        scenario: 'breakdown',
        title: 'Expressway Breakdown & Auto Rebalancing Triggered',
        vehicleId: 'TRK001',
        rebalanceTarget: 'VAN001',
        incidentCode: 'INC_9902',
        elapsedMs,
        spokenAlert: 'Warning: Vehicle TRK001 has experienced an expressway breakdown. Remaining drops auto rebalanced onto backup chassis VAN001.',
      });
    }

    if (scenario === 'cutoff_rush') {
      addIncident({
        id: 'inc_chaos_rush',
        code: 'INC_9903',
        type: 'window',
        severity: 'high',
        title: 'Pre Cutoff Surge: 12 priority supermarket orders submitted at 15:45 SLST',
        description: 'Surge volume exceeds standard departure run budgets. Rule 06 departure constraints activated. 4 orders routed to Deferral Desk.',
        vehicleId: 'VEH004',
        routeId: 'R025210',
        outletId: 'OUT001',
        status: 'OPEN',
        timestamp: '15:45 SLST',
      });

      const elapsedMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        scenario: 'cutoff_rush',
        title: 'Pre Cutoff Surge (15:45 SLST) Triggered',
        orderCount: 12,
        deferredCount: 4,
        incidentCode: 'INC_9903',
        elapsedMs,
        spokenAlert: 'Alert: Pre cutoff order surge detected. 12 urgent orders received at 15:45. Automated deferral filter active.',
      });
    }

    if (scenario === 'offline_sync') {
      addIncident({
        id: 'inc_chaos_sync',
        code: 'INC_9904',
        type: 'sync',
        severity: 'high',
        title: 'Central Highlands Blackout: Route R025229 entered cellular dead zone',
        description: 'Kamal Silva offline on Kadugannawa Pass. Local IndexedDB proof of delivery queue accumulating 2 drops with vector clock stamping.',
        vehicleId: 'VEH037',
        routeId: 'R025229',
        outletId: 'OUT003',
        status: 'OPEN',
        timestamp: '10:16 SLST',
      });

      const elapsedMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        scenario: 'offline_sync',
        title: 'Central Highlands Signal Blackout Triggered',
        routeId: 'R025229',
        incidentCode: 'INC_9904',
        elapsedMs,
        spokenAlert: 'Notice: Vehicle VEH037 entered cellular dead zone on Route R025229. Switching to local offline synchronization mode.',
      });
    }

    if (scenario === 'reset') {
      resetChaosIncidents();
      resetTelemetryState();

      const elapsedMs = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        scenario: 'reset',
        title: 'Baseline Operational State Restored',
        elapsedMs,
        spokenAlert: 'All operational parameters restored to baseline nominal state.',
      });
    }

    return NextResponse.json(
      { error: 'Unknown chaos scenario identifier' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

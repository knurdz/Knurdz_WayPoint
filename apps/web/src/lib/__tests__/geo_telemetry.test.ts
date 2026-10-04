import { describe, it, expect } from 'vitest';
import {
  calculateBearing,
  interpolateLatLng,
  getOutletLocation,
  predictVehiclePosition,
  getVehicleResolvedPosition,
  liveGpsStore,
  DEPOT_COORDINATES,
  OUTLET_COORDINATES,
} from '../geo_telemetry';

describe('Sri Lanka Geographic Telemetry & Predictive Routing', () => {
  it('correctly calculates cardinal bearings', () => {
    const colombo = { lat: 6.9271, lng: 79.8612 };
    const northOfColombo = { lat: 7.9271, lng: 79.8612 };
    const eastOfColombo = { lat: 6.9271, lng: 80.8612 };

    const northBearing = calculateBearing(colombo, northOfColombo);
    expect(Math.round(northBearing)).toBe(0);

    const eastBearing = calculateBearing(colombo, eastOfColombo);
    expect(Math.round(eastBearing)).toBe(90);
  });

  it('interpolates positions between two coordinates accurately', () => {
    const p1 = { lat: 6.0, lng: 80.0 };
    const p2 = { lat: 8.0, lng: 82.0 };

    const midpoint = interpolateLatLng(p1, p2, 0.5);
    expect(midpoint.lat).toBe(7.0);
    expect(midpoint.lng).toBe(81.0);

    const start = interpolateLatLng(p1, p2, 0.0);
    expect(start.lat).toBe(6.0);

    const end = interpolateLatLng(p1, p2, 1.0);
    expect(end.lat).toBe(8.0);
  });

  it('resolves mapped outlet coordinates and falls back to district center', () => {
    const out001 = getOutletLocation('OUT001');
    expect(out001.lat).toBe(OUTLET_COORDINATES['OUT001'].lat);
    expect(out001.lng).toBe(OUTLET_COORDINATES['OUT001'].lng);

    const unmapped = getOutletLocation('UNKNOWN_OUTLET', 'Kandy');
    expect(unmapped.lat).toBeGreaterThan(7.2);
    expect(unmapped.lat).toBeLessThan(7.4);
  });

  it('predicts vehicle position along corridor when no live GPS is present', () => {
    const route = [
      { outletId: 'OUT001', district: 'Colombo' },
      { outletId: 'OUT002', district: 'Colombo' },
      { outletId: 'OUT003', district: 'Colombo' },
    ];

    const predicted = predictVehiclePosition('VEH037', 'Peliyagoda', route);
    expect(predicted.source).toBe('predictive_interpolation');
    expect(predicted.lat).toBeGreaterThan(6.8);
    expect(predicted.lat).toBeLessThan(7.1);
    expect(predicted.lng).toBeGreaterThan(79.8);
    expect(predicted.lng).toBeLessThan(80.0);
  });

  it('uses live GPS fix when recent fix is present in store', () => {
    const route = [{ outletId: 'OUT001', district: 'Colombo' }];

    liveGpsStore['VEH_TEST'] = {
      vehicleId: 'VEH_TEST',
      lat: 6.915,
      lng: 79.855,
      speedKmH: 45,
      heading: 180,
      timestamp: Date.now(),
      source: 'driver_gps',
    };

    const resolved = getVehicleResolvedPosition('VEH_TEST', 'Peliyagoda', route);
    expect(resolved.isLive).toBe(true);
    expect(resolved.source).toBe('driver_gps');
    expect(resolved.lat).toBe(6.915);
    expect(resolved.speedKmH).toBe(45);
  });
});

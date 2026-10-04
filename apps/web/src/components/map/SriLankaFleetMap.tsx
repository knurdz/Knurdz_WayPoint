'use client';

import React, { useEffect, useRef } from 'react';
import type { MapVehicle } from '@/app/api/dispatcher/map/route';

interface SriLankaFleetMapProps {
  vehicles: MapVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
}

export default function SriLankaFleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: SriLankaFleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineGroupRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;

      // Dynamically import Leaflet to support Next.js SSR cleanly
      const L = (await import('leaflet')).default;

      // Ensure leaflet CSS is present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !containerRef.current) return;

      // Initialize map centered on Sri Lanka Western corridor
      const map = L.map(containerRef.current, {
        center: [6.9271, 79.8612],
        zoom: 11,
        zoomControl: true,
      });

      // CartoDB Positron / OSM tiles for crisp Uber/PickMe styled logistics view
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add Depot Markers
      const depotIcon = L.divIcon({
        className: 'wp-depot-marker',
        html: `
          <div style="background: #1e293b; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 2px solid #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span>
            DEPOT
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12],
      });

      L.marker([6.9654, 79.8841], { icon: depotIcon })
        .addTo(map)
        .bindPopup('<b>Peliyagoda Central Logistics Hub</b><br>Primary Dispatch & Cold Storage');

      L.marker([7.2906, 80.6337], { icon: depotIcon })
        .addTo(map)
        .bindPopup('<b>Kandy Regional Depot</b><br>Central Highlands Distribution');

      polylineGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update vehicle markers and routes whenever vehicles or selectedVehicleId changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      if (polylineGroupRef.current) {
        polylineGroupRef.current.clearLayers();
      }

      vehicles.forEach((v) => {
        const isSelected = v.id === selectedVehicleId;
        const isLive = v.telemetrySource === 'LIVE_GPS';

        // PickMe / Uber style vehicle marker with radar pulse for live GPS
        const vehicleHtml = `
          <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              isLive
                ? `<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
                : ''
            }
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${isSelected ? '#2563eb' : isLive ? '#10b981' : '#377a8b'};
              border: 3px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              transform: ${v.heading ? `rotate(${v.heading}deg)` : 'none'};
              transition: all 0.3s ease;
            ">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
              </svg>
            </div>
            <div style="
              position: absolute;
              bottom: -16px;
              background: rgba(15, 23, 42, 0.88);
              color: #ffffff;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
            ">
              ${v.code} · ${v.speedKmH}k
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'wp-fleet-vehicle-icon',
          html: vehicleHtml,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        });

        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .on('click', () => onSelectVehicle(v.id));

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 180px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="font-size: 13px; color: #0f172a;">${v.name}</strong>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${
                isLive ? '#dcfce7; color: #15803d;' : '#e0f2fe; color: #0369a1;'
              }">
                ${isLive ? 'LIVE SATELLITE GPS' : 'PREDICTIVE MODEL'}
              </span>
            </div>
            <div><strong>Driver:</strong> ${v.driverName}</div>
            <div><strong>Chassis:</strong> ${v.chassisLabel}</div>
            <div><strong>Speed:</strong> ${v.speedKmH} km/h (PickMe telematics)</div>
            <div><strong>Progress:</strong> ${v.completedStops}/${v.totalStops} stops completed</div>
            ${
              v.chilledTempC !== undefined
                ? `<div style="margin-top: 4px; padding: 3px 6px; border-radius: 4px; background: #f1f5f9; font-weight: 600;">
                     Thermal: ${v.chilledTempC}°C chilled · ${v.frozenTempC ?? -18}°C frozen
                   </div>`
                : ''
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current[v.id] = marker;

        // Draw delivery polyline and stop pins if selected
        if (isSelected && v.stops && v.stops.length > 0 && polylineGroupRef.current) {
          const latLngs: [number, number][] = [
            [v.lat, v.lng],
            ...v.stops.map((s): [number, number] => [s.lat, s.lng]),
          ];

          L.polyline(latLngs, {

            color: isLive ? '#10b981' : '#2563eb',
            weight: 4,
            opacity: 0.8,
            dashArray: isLive ? undefined : '6, 8',
          }).addTo(polylineGroupRef.current);

          v.stops.forEach((s) => {
            const stopIcon = L.divIcon({
              className: 'wp-stop-marker',
              html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  background: ${s.status === 'Delivered' ? '#16a34a' : s.status === 'EnRoute' ? '#2563eb' : '#f59e0b'};
                  color: #ffffff;
                  font-size: 10px;
                  font-weight: 800;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ">
                  ${s.stopNumber}
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            L.marker([s.lat, s.lng], { icon: stopIcon })
              .addTo(polylineGroupRef.current)
              .bindPopup(`<b>Stop ${s.stopNumber}: ${s.outletName}</b><br>Status: ${s.status}<br>ETA: ${s.eta}`);
          });

          // Smoothly pan to selected vehicle
          map.panTo([v.lat, v.lng], { animate: true, duration: 0.8 });
        }
      });
    }

    updateMarkers();
  }, [vehicles, selectedVehicleId, onSelectVehicle]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '480px', borderRadius: '8px' }} />
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '6px 12px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#10b981',
            display: 'inline-block',
            boxShadow: '0 0 6px #10b981',
          }}
        />
        <span style={{ fontWeight: 600, color: '#1e293b' }}>
          Sri Lanka Fleet Telemetry · PickMe / Uber Precision
        </span>
      </div>
    </div>
  );
}

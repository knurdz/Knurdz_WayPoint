'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { MapVehicle } from '@/app/api/dispatcher/map/route';
import { createVehicleSvg } from './VehicleMapIcon';

interface SriLankaFleetMapProps {
  vehicles: MapVehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  activeChassisFilter?: 'all' | 'fridge' | 'van' | 'truck';
  onFilterChange?: (filter: 'all' | 'fridge' | 'van' | 'truck') => void;
}

export default function SriLankaFleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  activeChassisFilter,
  onFilterChange,
}: SriLankaFleetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineGroupRef = useRef<any>(null);

  // Map display filters
  const [internalFilterType, setInternalFilterType] = useState<'all' | 'fridge' | 'van' | 'truck'>('all');
  const filterType = activeChassisFilter !== undefined ? activeChassisFilter : internalFilterType;

  const setFilterType = (newFilter: 'all' | 'fridge' | 'van' | 'truck') => {
    setInternalFilterType(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };
  const [loadFilter, setLoadFilter] = useState<'all' | 'empty' | 'half' | 'full'>('all');

  // Prevent Leaflet map from absorbing click/drag events on the control panel
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    async function setupControlEvents() {
      if (!controlsRef.current) return;
      const L = (await import('leaflet')).default;
      if (controlsRef.current) {
        L.DomEvent.disableClickPropagation(controlsRef.current);
        L.DomEvent.disableScrollPropagation(controlsRef.current);
      }
    }
    setupControlEvents();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!containerRef.current || mapInstanceRef.current) return;

      // Dynamically import Leaflet to support Next.js SSR cleanly
      const L = (await import('leaflet')).default;

      if (!isMounted || !containerRef.current) return;

      // Initialize map centered on Sri Lanka Western corridor
      const map = L.map(containerRef.current, {
        center: [6.9271, 79.8612],
        zoom: 11,
        zoomControl: true,
      });

      // OpenStreetMap standard tile layer (100% free, public, zero API key required)
      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ||
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Depot Markers
      const depotIcon = L.divIcon({
        className: 'wp-depot-marker',
        html: `
          <div style="background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 2px solid #38bdf8; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 5px; white-space: nowrap;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #38bdf8;"></span>
            DEPOT
          </div>
        `,
        iconSize: [64, 26],
        iconAnchor: [32, 13],
      });

      L.marker([6.9654, 79.8841], { icon: depotIcon })
        .addTo(map)
        .bindPopup('<b>Peliyagoda Central Logistics Hub</b><br>Primary Dispatch & Cold Storage Depot');

      L.marker([7.2906, 80.6337], { icon: depotIcon })
        .addTo(map)
        .bindPopup('<b>Kandy Regional Depot</b><br>Central Highlands Distribution Hub');

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

  // Filtered vehicles
  const displayedVehicles = vehicles.filter((v) => {
    if (filterType === 'fridge' && !v.hasFridge) return false;
    if (filterType === 'van' && !v.chassis.includes('van')) return false;
    if (filterType === 'truck' && !v.chassis.includes('truck')) return false;
    if (loadFilter !== 'all' && v.loadStatus !== loadFilter) return false;
    return true;
  });

  // Update vehicle markers and routes
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

      displayedVehicles.forEach((v) => {
        const isSelected = v.id === selectedVehicleId;
        const isLive = v.telemetrySource === 'LIVE_GPS';

        // PickMe / Uber style top-down vehicle SVG icon
        const vehicleSvgHtml = createVehicleSvg({
          code: v.code,
          chassis: v.chassis,
          hasFridge: v.hasFridge ?? v.chassis.includes('freezer'),
          loadStatus: v.loadStatus ?? 'half',
          loadPct: v.loadPct ?? 50,
          speedKmH: v.speedKmH,
          heading: v.heading || 0,
          isSelected,
          isLiveGps: isLive,
        });

        const iconWidth = v.chassis.includes('truck') ? 48 : 42;
        const iconHeight = v.chassis.includes('truck') ? 94 : 78;

        const icon = L.divIcon({
          className: 'wp-fleet-vehicle-icon',
          html: vehicleSvgHtml,
          iconSize: [iconWidth, iconHeight],
          iconAnchor: [iconWidth / 2, iconHeight / 2],
        });

        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .on('click', () => onSelectVehicle(v.id));

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; line-height: 1.45; min-width: 210px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <strong style="font-size: 13px; color: #0f172a;">${v.name}</strong>
              <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${
                isLive ? '#dcfce7; color: #15803d;' : '#e0f2fe; color: #0369a1;'
              }">
                ${isLive ? 'LIVE SATELLITE GPS' : 'PREDICTIVE INTERPOLATION'}
              </span>
            </div>
            <div><strong>Driver:</strong> ${v.driverName}</div>
            <div><strong>Chassis:</strong> ${v.chassisLabel} ${v.hasFridge ? '<span style="color: #0284c7; font-weight: 700;">(Blue Reefer ❄)</span>' : ''}</div>
            <div><strong>Load Status:</strong> <span style="font-weight: 700; text-transform: uppercase; color: ${v.loadStatus === 'full' ? '#ef4444' : v.loadStatus === 'half' ? '#f59e0b' : '#64748b'};">${v.loadStatus ?? 'HALF'} LOAD</span> (${v.loadPct ?? 50}% · ${v.weightKg ?? 1500}kg / ${v.maxWeightKg ?? 2000}kg)</div>
            <div><strong>PickMe Speed:</strong> ${v.speedKmH} km/h · Heading ${v.heading || 0}°</div>
            <div><strong>Progress:</strong> ${v.completedStops}/${v.totalStops} stops completed</div>
            ${
              v.chilledTempC !== undefined
                ? `<div style="margin-top: 6px; padding: 4px 8px; border-radius: 4px; background: #f0f9ff; border: 1px solid #bae6fd; font-weight: 600; color: #0369a1;">
                     ❄ Reefer: ${v.chilledTempC}°C chilled · ${v.frozenTempC ?? -18}°C frozen
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
            color: isLive ? '#10b981' : '#0284c7',
            weight: 4,
            opacity: 0.85,
            dashArray: isLive ? undefined : '6, 8',
          }).addTo(polylineGroupRef.current);

          v.stops.forEach((s) => {
            const stopIcon = L.divIcon({
              className: 'wp-stop-marker',
              html: `
                <div style="
                  width: 22px;
                  height: 22px;
                  border-radius: 50%;
                  background: ${s.status === 'Delivered' ? '#16a34a' : s.status === 'EnRoute' ? '#0284c7' : '#f59e0b'};
                  color: #ffffff;
                  font-size: 11px;
                  font-weight: 800;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 2px solid #ffffff;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.35);
                ">
                  ${s.stopNumber}
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });

            L.marker([s.lat, s.lng], { icon: stopIcon })
              .addTo(polylineGroupRef.current)
              .bindPopup(`<b>Stop ${s.stopNumber}: ${s.outletName}</b><br>Status: ${s.status}<br>ETA: ${s.eta}`);
          });

          // Smoothly pan to selected vehicle and open its telematics popup
          map.panTo([v.lat, v.lng], { animate: true, duration: 0.8 });
          marker.openPopup();
        }
      });
    }

    updateMarkers();
  }, [displayedVehicles, selectedVehicleId, onSelectVehicle]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '520px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '520px', borderRadius: '8px' }} />

      {/* Top Left: PickMe / Uber Map Filter Controls */}
      <div
        ref={controlsRef}
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '6px 10px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          border: '1px solid rgba(0,0,0,0.08)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginRight: 4 }}>Chassis:</span>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filterType === 'all' ? '#0f172a' : '#f1f5f9',
              color: filterType === 'all' ? '#ffffff' : '#334155',
            }}
          >
            All ({vehicles.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('fridge')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filterType === 'fridge' ? '#0284c7' : '#f0f9ff',
              color: filterType === 'fridge' ? '#ffffff' : '#0284c7',
            }}
          >
            ❄ Blue Fridge ({vehicles.filter((v) => v.hasFridge).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('van')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filterType === 'van' ? '#10b981' : '#f1f5f9',
              color: filterType === 'van' ? '#ffffff' : '#334155',
            }}
          >
            Vans
          </button>
          <button
            type="button"
            onClick={() => setFilterType('truck')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filterType === 'truck' ? '#334155' : '#f1f5f9',
              color: filterType === 'truck' ? '#ffffff' : '#334155',
            }}
          >
            Trucks
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginRight: 4 }}>Load:</span>
          <button
            type="button"
            onClick={() => setLoadFilter('all')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: loadFilter === 'all' ? '#0f172a' : '#f1f5f9',
              color: loadFilter === 'all' ? '#ffffff' : '#334155',
            }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setLoadFilter('full')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: loadFilter === 'full' ? '#ef4444' : '#fef2f2',
              color: loadFilter === 'full' ? '#ffffff' : '#b91c1c',
            }}
          >
            Full Load
          </button>
          <button
            type="button"
            onClick={() => setLoadFilter('half')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: loadFilter === 'half' ? '#f59e0b' : '#fffbeb',
              color: loadFilter === 'half' ? '#ffffff' : '#b45309',
            }}
          >
            Half Load
          </button>
          <button
            type="button"
            onClick={() => setLoadFilter('empty')}
            style={{
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: loadFilter === 'empty' ? '#64748b' : '#f8fafc',
              color: loadFilter === 'empty' ? '#ffffff' : '#475569',
            }}
          >
            Empty
          </button>
        </div>
      </div>

      {/* Top Right: Status Legend */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.96)',
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
          PickMe / Uber Live Fleet Telematics
        </span>
      </div>
    </div>
  );
}

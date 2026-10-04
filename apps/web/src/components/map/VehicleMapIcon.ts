/**
 * VehicleMapIcon.ts
 * Generates custom SVG vehicle markers styled after PickMe and Uber logistics:
 * - Vans vs Trucks (aerodynamic van vs heavy box truck chassis)
 * - Refrigerated vehicles rendered as Blue Van / Blue Truck with reefer condenser & snowflake
 * - Ambient vehicles rendered in standard commercial liveries
 * - Cargo Load Level Meter: Empty (0-15%), Half Load (15-70%), Full Load (70-100%)
 * - Smooth compass heading directional rotation
 */

export interface VehicleIconOptions {
  code: string;
  chassis: 'van' | 'truck' | 'van_freezer' | 'truck_freezer';
  hasFridge: boolean;
  loadStatus: 'empty' | 'half' | 'full';
  loadPct: number;
  speedKmH: number;
  heading: number;
  isSelected?: boolean;
  isLiveGps?: boolean;
}

export function createVehicleSvg(opts: VehicleIconOptions): string {
  const {
    code,
    chassis,
    hasFridge,
    loadStatus,
    loadPct,
    speedKmH,
    heading,
    isSelected = false,
    isLiveGps = false,
  } = opts;

  const isTruck = chassis.includes('truck');

  // Color scheme: Blue Van / Blue Truck for Fridge, standard for ambient
  const primaryColor = hasFridge
    ? isTruck
      ? '#0284c7' // Blue Truck primary
      : '#0ea5e9' // Blue Van primary
    : isTruck
    ? '#334155' // Slate Truck primary
    : '#10b981'; // Emerald Van primary

  const accentColor = hasFridge
    ? isTruck
      ? '#38bdf8'
      : '#7dd3fc'
    : isTruck
    ? '#64748b'
    : '#34d399';

  // Load level colors & fill indicators
  const loadColor =
    loadStatus === 'full' ? '#ef4444' : loadStatus === 'half' ? '#f59e0b' : '#94a3b8';
  const loadText = loadStatus === 'full' ? 'FULL' : loadStatus === 'half' ? 'HALF' : 'EMPTY';

  // Dimensions
  const svgWidth = isTruck ? 44 : 38;
  const svgHeight = isTruck ? 72 : 58;

  // Render Truck SVG
  if (isTruck) {
    return `
      <div style="position: relative; width: ${svgWidth}px; height: ${svgHeight + 22}px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
        <!-- Pulsing Radar Ripple for Live GPS -->
        ${
          isLiveGps
            ? `<div style="position: absolute; top: 14px; width: 56px; height: 56px; border-radius: 50%; background: rgba(16, 185, 129, 0.28); animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>`
            : ''
        }

        <!-- Rotating Vehicle Glyph -->
        <div style="
          width: ${svgWidth}px;
          height: ${svgHeight}px;
          transform: rotate(${heading}deg);
          transition: transform 0.4s ease-out;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
        ">
          <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 44 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Truck Cab (Front) -->
            <path d="M10 2 C10 0, 34 0, 34 2 L36 18 C36 21, 8 21, 8 18 Z" fill="${primaryColor}" />
            <path d="M12 4 C12 2, 32 2, 32 4 L33 13 C33 14, 11 14, 11 13 Z" fill="#0f172a" opacity="0.85" />
            <!-- Side Mirrors -->
            <rect x="5" y="10" width="3" height="5" rx="1.5" fill="#1e293b" />
            <rect x="36" y="10" width="3" height="5" rx="1.5" fill="#1e293b" />

            <!-- Reefer Unit on Bulkhead (If equipped with fridge) -->
            ${
              hasFridge
                ? `<rect x="14" y="18" width="16" height="5" rx="2" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1"/>
                   <circle cx="17" cy="20.5" r="1.5" fill="#0284c7" />
                   <circle cx="27" cy="20.5" r="1.5" fill="#0284c7" />`
                : ''
            }

            <!-- Cargo Box (Rear) -->
            <rect x="7" y="23" width="30" height="46" rx="4" fill="${primaryColor}" stroke="${isSelected ? '#ffffff' : accentColor}" stroke-width="${isSelected ? '2.5' : '1.5'}" />

            <!-- Roof Load Fill Bay -->
            <rect x="10" y="27" width="24" height="38" rx="2" fill="#0f172a" opacity="0.15" />
            
            ${
              loadStatus === 'full'
                ? `<!-- Full Load: Solid Filled Stack -->
                   <rect x="12" y="29" width="20" height="34" rx="2" fill="${loadColor}" opacity="0.9" />
                   <line x1="12" y1="40" x2="32" y2="40" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
                   <line x1="12" y1="51" x2="32" y2="51" stroke="#ffffff" stroke-width="1" opacity="0.6"/>`
                : loadStatus === 'half'
                ? `<!-- Half Load: Half Filled Bay -->
                   <rect x="12" y="46" width="20" height="17" rx="2" fill="${loadColor}" opacity="0.9" />
                   <rect x="12" y="29" width="20" height="16" rx="2" fill="none" stroke="${loadColor}" stroke-dasharray="2,2" stroke-width="1"/>`
                : `<!-- Empty Load: Dashed Bay -->
                   <rect x="12" y="29" width="20" height="34" rx="2" fill="none" stroke="${loadColor}" stroke-dasharray="3,3" stroke-width="1.2"/>`
            }

            <!-- Fridge Snowflake Glyph -->
            ${
              hasFridge
                ? `<text x="22" y="38" font-size="10" text-anchor="middle" fill="#ffffff" font-weight="bold">❄</text>`
                : ''
            }

            <!-- Rear Tail Lights -->
            <rect x="9" y="68" width="5" height="2" rx="1" fill="#ef4444" />
            <rect x="30" y="68" width="5" height="2" rx="1" fill="#ef4444" />
          </svg>
        </div>

        <!-- PickMe / Uber Style Telemetry Badge -->
        <div style="
          margin-top: 4px;
          background: ${hasFridge ? 'rgba(2, 132, 199, 0.94)' : 'rgba(15, 23, 42, 0.92)'};
          color: #ffffff;
          font-size: 9px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          ${hasFridge ? '<span style="color: #bae6fd;">❄</span>' : ''}
          <span>${code}</span>
          <span style="opacity: 0.6;">·</span>
          <span>${speedKmH}k</span>
          <span style="opacity: 0.6;">·</span>
          <span style="color: ${loadColor};">${loadText}</span>
        </div>
      </div>
    `;
  }

  // Render Van SVG
  return `
    <div style="position: relative; width: ${svgWidth}px; height: ${svgHeight + 20}px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
      <!-- Pulsing Radar Ripple for Live GPS -->
      ${
        isLiveGps
          ? `<div style="position: absolute; top: 10px; width: 50px; height: 50px; border-radius: 50%; background: rgba(16, 185, 129, 0.28); animation: ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>`
          : ''
      }

      <!-- Rotating Van Glyph -->
      <div style="
        width: ${svgWidth}px;
        height: ${svgHeight}px;
        transform: rotate(${heading}deg);
        transition: transform 0.4s ease-out;
        filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
      ">
        <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 38 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Aerodynamic Van Chassis -->
          <rect x="7" y="2" width="24" height="54" rx="8" fill="${primaryColor}" stroke="${isSelected ? '#ffffff' : accentColor}" stroke-width="${isSelected ? '2.5' : '1.5'}" />
          
          <!-- Curved Windshield -->
          <path d="M10 10 C10 7, 28 7, 28 10 L27 16 C27 17, 11 17, 11 16 Z" fill="#0f172a" opacity="0.85" />
          
          <!-- Side Mirrors -->
          <rect x="4" y="11" width="3" height="4" rx="1.5" fill="#1e293b" />
          <rect x="31" y="11" width="3" height="4" rx="1.5" fill="#1e293b" />

          <!-- Roof Cargo Fill Area -->
          <rect x="10" y="22" width="18" height="30" rx="3" fill="#0f172a" opacity="0.15" />

          ${
            loadStatus === 'full'
              ? `<!-- Full Load: Solid Bay -->
                 <rect x="11" y="23" width="16" height="28" rx="2" fill="${loadColor}" opacity="0.9" />
                 <line x1="11" y1="37" x2="27" y2="37" stroke="#ffffff" stroke-width="1" opacity="0.6"/>`
              : loadStatus === 'half'
              ? `<!-- Half Load -->
                 <rect x="11" y="37" width="16" height="14" rx="2" fill="${loadColor}" opacity="0.9" />
                 <rect x="11" y="23" width="16" height="13" rx="2" fill="none" stroke="${loadColor}" stroke-dasharray="2,2" stroke-width="1"/>`
              : `<!-- Empty Load -->
                 <rect x="11" y="23" width="16" height="28" rx="2" fill="none" stroke="${loadColor}" stroke-dasharray="2.5,2.5" stroke-width="1"/>`
          }

          <!-- Fridge Chiller Unit on Roof -->
          ${
            hasFridge
              ? `<circle cx="19" cy="30" r="5" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1" />
                 <text x="19" y="33.5" font-size="8" text-anchor="middle" fill="#0284c7" font-weight="bold">❄</text>`
              : ''
          }

          <!-- Tail Lights -->
          <rect x="8" y="54" width="4" height="2" rx="1" fill="#ef4444" />
          <rect x="26" y="54" width="4" height="2" rx="1" fill="#ef4444" />
        </svg>
      </div>

      <!-- PickMe / Uber Style Telemetry Badge -->
      <div style="
        margin-top: 3px;
        background: ${hasFridge ? 'rgba(14, 165, 233, 0.95)' : 'rgba(15, 23, 42, 0.92)'};
        color: #ffffff;
        font-size: 9px;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 2px 5px;
        border-radius: 4px;
        white-space: nowrap;
        border: 1px solid rgba(255,255,255,0.25);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        ${hasFridge ? '<span style="color: #e0f2fe;">❄</span>' : ''}
        <span>${code}</span>
        <span style="opacity: 0.6;">·</span>
        <span>${speedKmH}k</span>
        <span style="opacity: 0.6;">·</span>
        <span style="color: ${loadColor};">${loadText}</span>
      </div>
    </div>
  `;
}

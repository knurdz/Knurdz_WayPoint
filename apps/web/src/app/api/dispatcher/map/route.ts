import { NextResponse } from "next/server";

export interface MapVehicle {
  id: string;
  name: string;
  code: string;
  driverName: string;
  routeId: string;
  chassis: "truck" | "truck_freezer" | "van_freezer";
  chassisLabel: string;
  markerType: "rect" | "circle";
  color: string;
  x: number;
  y: number;
  completedStops: number;
  totalStops: number;
  isOnline: boolean;
  statusText: string;
  stops: {
    stopNumber: number;
    outletCode: string;
    outletName: string;
    status: "Delivered" | "Pending" | "EnRoute";
    eta: string;
  }[];
}

const fleetVehicles: MapVehicle[] = [
  {
    id: "VEH037",
    name: "VEH037",
    code: "037",
    driverName: "Kamal Silva",
    routeId: "R025229",
    chassis: "van_freezer",
    chassisLabel: "Van + Freezer",
    markerType: "circle",
    color: "#16a34a",
    x: 272,
    y: 186,
    completedStops: 2,
    totalStops: 4,
    isOnline: true,
    statusText: "Kamal Silva · 2/4 stops",
    stops: [
      { stopNumber: 1, outletCode: "OUT001", outletName: "Fresh Galle Rd", status: "Delivered", eta: "05:45 SLST" },
      { stopNumber: 2, outletCode: "OUT003", outletName: "Peradeniya Store", status: "Delivered", eta: "06:35 SLST" },
      { stopNumber: 3, outletCode: "OUT004", outletName: "Kandy Mall", status: "Pending", eta: "07:15 SLST" },
      { stopNumber: 4, outletCode: "OUT008", outletName: "Katugastota", status: "Pending", eta: "07:50 SLST" },
    ],
  },
  {
    id: "VEH004",
    name: "VEH004",
    code: "004",
    driverName: "Niroshan Bandara",
    routeId: "R025210",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    markerType: "rect",
    color: "#377a8b",
    x: 96,
    y: 188,
    completedStops: 0,
    totalStops: 5,
    isOnline: true,
    statusText: "Loading · Bay 04",
    stops: [
      { stopNumber: 1, outletCode: "OUT005", outletName: "Peliyagoda Hub", status: "EnRoute", eta: "06:30 SLST" },
      { stopNumber: 2, outletCode: "OUT006", outletName: "Wattala Express", status: "Pending", eta: "07:10 SLST" },
      { stopNumber: 3, outletCode: "OUT007", outletName: "Ja Ela Super", status: "Pending", eta: "07:45 SLST" },
    ],
  },
  {
    id: "VEH002",
    name: "VEH002",
    code: "002",
    driverName: "Dinesh Priyantha",
    routeId: "R025214",
    chassis: "van_freezer",
    chassisLabel: "Van + Freezer",
    markerType: "circle",
    color: "#16a34a",
    x: 176,
    y: 232,
    completedStops: 4,
    totalStops: 4,
    isOnline: false,
    statusText: "Dinesh · 4/4 done",
    stops: [
      { stopNumber: 1, outletCode: "OUT002", outletName: "Duplication Rd", status: "Delivered", eta: "05:15 SLST" },
      { stopNumber: 2, outletCode: "OUT009", outletName: "Bambalapitiya", status: "Delivered", eta: "05:50 SLST" },
      { stopNumber: 3, outletCode: "OUT010", outletName: "Wellawatte", status: "Delivered", eta: "06:20 SLST" },
      { stopNumber: 4, outletCode: "OUT011", outletName: "Dehiwala", status: "Delivered", eta: "06:55 SLST" },
    ],
  },
  {
    id: "VEH001",
    name: "VEH001",
    code: "001",
    driverName: "Sunil Mendis",
    routeId: "R025208",
    chassis: "truck",
    chassisLabel: "Dry Truck",
    markerType: "rect",
    color: "#64748b",
    x: 416,
    y: 192,
    completedStops: 3,
    totalStops: 6,
    isOnline: true,
    statusText: "Sunil Mendis · 3/6 stops",
    stops: [
      { stopNumber: 1, outletCode: "OUT012", outletName: "Kelaniya", status: "Delivered", eta: "05:20 SLST" },
      { stopNumber: 2, outletCode: "OUT013", outletName: "Kiribathgoda", status: "Delivered", eta: "05:55 SLST" },
      { stopNumber: 3, outletCode: "OUT014", outletName: "Kadawatha", status: "Delivered", eta: "06:30 SLST" },
      { stopNumber: 4, outletCode: "OUT015", outletName: "Gampaha", status: "EnRoute", eta: "07:15 SLST" },
    ],
  },
  {
    id: "VEH003",
    name: "VEH003",
    code: "003",
    driverName: "Ruwan Dias",
    routeId: "R025218",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    markerType: "rect",
    color: "#377a8b",
    x: 544,
    y: 198,
    completedStops: 1,
    totalStops: 5,
    isOnline: true,
    statusText: "Ruwan Dias · 1/5 stops",
    stops: [
      { stopNumber: 1, outletCode: "OUT016", outletName: "Nittambuwa", status: "Delivered", eta: "06:00 SLST" },
      { stopNumber: 2, outletCode: "OUT017", outletName: "Waragoda", status: "EnRoute", eta: "06:45 SLST" },
    ],
  },
  {
    id: "VEH005",
    name: "VEH005",
    code: "005",
    driverName: "Anura Kumara",
    routeId: "R025225",
    chassis: "truck_freezer",
    chassisLabel: "Truck + Freezer",
    markerType: "rect",
    color: "#377a8b",
    x: 624,
    y: 128,
    completedStops: 0,
    totalStops: 4,
    isOnline: true,
    statusText: "Planned · Trip 2",
    stops: [
      { stopNumber: 1, outletCode: "OUT018", outletName: "Avissawella", status: "Pending", eta: "08:00 SLST" },
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    corridorName: "Colombo Coastal and Hill Country Corridor",
    timestamp: new Date().toISOString(),
    vehicles: fleetVehicles,
  });
}

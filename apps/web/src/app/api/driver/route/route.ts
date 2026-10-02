import { NextResponse } from "next/server";

export async function GET() {
  const driverData = {
    routeId: "R025229",
    vehicleId: "VEH037",
    driverName: "Kamal Silva",
    status: "Route Active",
    corridor: "Coastal corridor · Nissan Cabstar · 1 of 4 stops delivered",
    offlineSyncCount: 3,
    isOffline: false,
    chassis: "van_freezer",
    stops: [
      {
        id: "stop_1",
        seq: 1,
        deliveryCode: "DEL_88401",
        outletCode: "OUT001",
        outletName: "Fresh Galle Rd",
        access: "van_only",
        status: "Delivered",
        meta: "POD signed 05:32 · 1,840 kg",
        receiverName: "Nimal Perera",
        handoverTime: "05:32 SLST",
      },
      {
        id: "stop_2",
        seq: 2,
        deliveryCode: "DEL_88402",
        outletCode: "OUT002",
        outletName: "Duplication Rd",
        access: "van_only",
        status: "In Transit",
        meta: "14 min · window closes 08:00",
        cargo: [
          { name: "Bread", qty: "80 bundles · ambient" },
          { name: "Rice", qty: "45 sacks · 2,100 kg" },
        ],
        windowSlack: "1h 42m",
        windowCloses: "08:00 SLST",
        volumeM3: 5.4,
        receiverName: "Anjali Jayawardena",
      },
      {
        id: "stop_3",
        seq: 3,
        deliveryCode: "DEL_88403",
        outletCode: "OUT003",
        outletName: "Peradeniya Store",
        access: "van_only",
        status: "Pending",
        meta: "ETA 08:45 · window closes 09:30",
        cargo: [
          { name: "Dairy Cases", qty: "42 cases · chilled" },
        ],
        windowSlack: "45m",
        windowCloses: "09:30 SLST",
        volumeM3: 3.2,
        receiverName: "Bandara Senanayake",
      },
      {
        id: "stop_4",
        seq: 4,
        deliveryCode: "DEL_88404",
        outletCode: "OUT004",
        outletName: "Kandy Central Mall",
        access: "mall_dock",
        status: "Pending",
        meta: "ETA 09:15 · window closes 10:00",
        cargo: [
          { name: "Frozen Veg", qty: "20 cartons · frozen" },
        ],
        windowSlack: "45m",
        windowCloses: "10:00 SLST",
        volumeM3: 4.1,
        receiverName: "Roshan Gamage",
      },
    ],
  };

  return NextResponse.json(driverData);
}

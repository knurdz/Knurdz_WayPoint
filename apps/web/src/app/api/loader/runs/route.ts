import { NextResponse } from "next/server";

export async function GET() {
  const runs = [
    {
      id: "run_1",
      vehicle: "VEH037",
      trip: "Trip 1",
      title: "Fresh · Colombo · 4 stops",
      status: "Loading",
      stopsCount: 4,
      link: "/loader",
    },
    {
      id: "run_2",
      vehicle: "VEH004",
      trip: "Trip 1",
      title: "Fresh · Gampaha · 6 stops",
      status: "Not started",
      stopsCount: 6,
      link: "/loader",
    },
    {
      id: "run_3",
      vehicle: "VEH001",
      trip: "Trip 2",
      title: "Style and Tech · Kandy",
      status: "Ready",
      stopsCount: 5,
      link: "/loader",
    },
  ];

  return NextResponse.json({ success: true, runs });
}

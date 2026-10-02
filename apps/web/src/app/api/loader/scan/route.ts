import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, bayId, vehicleId } = body;

    const validSkus: Record<string, { name: string; stop: number; temp: string; qty: string }> = {
      "SKU_FZ_VEG_01": { name: "Frozen Farm Vegetables 1kg", stop: 4, temp: "18C Frozen", qty: "12 Cases" },
      "SKU_CH_YOG_02": { name: "Chilled Greek Yogurt 500g", stop: 4, temp: "4C Chilled", qty: "8 Cases" },
      "SKU_AM_RICE_05": { name: "Ambient Organic Brown Rice 5kg", stop: 3, temp: "Ambient", qty: "20 Sacks" },
      "SKU_CH_MILK_04": { name: "Fresh Pasteurised Milk 1L", stop: 2, temp: "4C Chilled", qty: "15 Cases" },
      "SKU_AM_FLOUR_01": { name: "Bakers Choice Flour 25kg", stop: 1, temp: "Ambient", qty: "10 Bags" },
      "SKU_CH_BUTTER_03": { name: "Salted Table Butter 200g", stop: 1, temp: "4C Chilled", qty: "6 Cartons" },
    };

    const item = validSkus[sku];
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Unrecognized SKU barcode" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sku,
      bayId: bayId || "Bay 04",
      vehicleId: vehicleId || "VEH004",
      item,
      message: `Verified and loaded: ${item.name} into stop ${item.stop}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Scan processing failed", details: String(error) },
      { status: 500 }
    );
  }
}

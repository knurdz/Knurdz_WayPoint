import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deliveryCode, receiverName, signatureData, photoCaptured, verifiedQty } = body;

    const podId = `POD_${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      podId,
      deliveryCode: deliveryCode || "DEL_88401",
      receiverName: receiverName || "Anjali Jayawardena",
      verifiedQty: Boolean(verifiedQty),
      hasSignature: Boolean(signatureData),
      hasPhoto: Boolean(photoCaptured),
      timestamp: new Date().toISOString(),
      message: `Proof of delivery ${podId} recorded and verified. Stop marked delivered.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to record POD", details: String(error) },
      { status: 500 }
    );
  }
}

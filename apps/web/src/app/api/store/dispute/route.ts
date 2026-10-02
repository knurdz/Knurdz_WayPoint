import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deliveryCode, missingCount, damagedNotes, signatureSigned } = body;

    const disputeRecord = {
      disputeId: `DSP_${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryCode: deliveryCode || "DEL_88390",
      status: "UNDER_REVIEW",
      createdAt: new Date().toISOString(),
      missingCount: Number(missingCount) || 0,
      damagedNotes: damagedNotes || "None",
      signatureSigned: Boolean(signatureSigned),
      message: "Dispute ticket generated and routed to Dispatcher Incident Desk",
    };

    return NextResponse.json(disputeRecord);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit POD dispute", details: String(error) },
      { status: 500 }
    );
  }
}

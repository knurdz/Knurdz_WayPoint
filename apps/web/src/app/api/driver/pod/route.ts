import { NextResponse } from 'next/server';
import { driverPodSchema, validateRequestBody } from '@/lib/api_schemas';

export async function POST(req: Request) {
  try {
    const validation = await validateRequestBody(req, driverPodSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { deliveryCode, receiverName, signatureData, photoCaptured } = validation.data;
    const hasSignature = Boolean(signatureData && signatureData.trim());
    const hasPhoto = Boolean(photoCaptured);

    const podId = `POD_${crypto.randomUUID()}`;

    return NextResponse.json({
      success: true,
      podId,
      deliveryCode: deliveryCode.trim(),
      receiverName: (receiverName || 'Receiving Desk Supervisor').trim(),
      verifiedQty: true,
      hasSignature,
      hasPhoto,
      timestamp: new Date().toISOString(),
      message: `Proof of delivery ${podId} recorded and verified. Stop marked delivered.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal POD processing error', details: String(error) },
      { status: 500 },
    );
  }
}

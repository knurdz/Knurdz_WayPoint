import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request payload', code: 'INVALID_PAYLOAD' },
        { status: 400 },
      );
    }

    const { deliveryCode, receiverName, signatureData, photoCaptured, verifiedQty } = body;

    if (!deliveryCode || typeof deliveryCode !== 'string' || !deliveryCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Delivery code is required', code: 'MISSING_DELIVERY_CODE' },
        { status: 400 },
      );
    }

    const hasSignature = Boolean(
      signatureData && typeof signatureData === 'string' && signatureData.trim(),
    );
    const hasPhoto = Boolean(photoCaptured);

    if (!hasSignature && !hasPhoto) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proof of delivery requires either receiver signature or delivery photo',
          code: 'MISSING_VERIFICATION_ARTIFACT',
        },
        { status: 400 },
      );
    }

    if (!verifiedQty) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantity confirmation is required before submitting proof of delivery',
          code: 'QUANTITY_NOT_VERIFIED',
        },
        { status: 400 },
      );
    }

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

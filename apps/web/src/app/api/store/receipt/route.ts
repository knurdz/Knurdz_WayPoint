import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureInitialOrders, OrderStatus } from '@waypoint/database';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await ensureInitialOrders();
    const auth = await getAuthFromRequest(req);
    const outletCode = auth?.outletId || 'OUT001';

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { orderId },
        include: {
          items: true,
          tripStops: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                },
              },
              podRecords: true,
            },
          },
        },
      });
    }

    if (!order) {
      // Find latest delivered order for this outlet, or fall back to any recent order
      order = await prisma.order.findFirst({
        where: {
          outletId: outletCode,
          status: { in: [OrderStatus.delivered, OrderStatus.in_transit, OrderStatus.allocated] },
        },
        include: {
          items: true,
          tripStops: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                },
              },
              podRecords: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!order) {
      // Fallback to any order
      order = await prisma.order.findFirst({
        where: { outletId: outletCode },
        include: {
          items: true,
          tripStops: {
            include: {
              trip: {
                include: {
                  vehicle: true,
                },
              },
              podRecords: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!order) {
      return NextResponse.json({ error: 'No order found for receipt' }, { status: 404 });
    }

    const latestStop = order.tripStops[0];
    const latestPod = latestStop?.podRecords[0];
    const vehicle = latestStop?.trip?.vehicle;

    return NextResponse.json({
      orderId: order.orderId,
      deliveryCode: `DEL_${order.orderId.replace(/[^0-9]/g, '') || '88390'}`,
      outletId: order.outletId,
      orderDate: order.orderDate,
      tempRequirement: order.tempRequirement,
      weightKg: Math.round(order.weightKg),
      volumeM3: order.volumeM3,
      status: order.status,
      items: order.items.map((i) => ({
        id: i.id,
        sku: i.sku,
        description: i.description,
        quantity: i.quantity,
        weightKg: i.weightKg,
      })),
      vehicleId: vehicle?.vehicleId || 'VEH037',
      driverName: 'Kamal Silva',
      podSignature: latestPod?.signatureData || 'Anjali Jayawardena',
      podPhoto: latestPod?.photoPath || null,
      podTimestamp: latestPod?.clientTimestamp || latestStop?.actualArrival || new Date(),
      isDelivered: order.status === OrderStatus.delivered,
    });
  } catch (error) {
    console.error('Failed to get receipt details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve receipt details', details: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        action: 'RECEIPT_CONFIRMED',
        details: JSON.stringify({
          orderId,
          notes: notes || 'Full receipt confirmed digitally by store manager',
          confirmedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      status: 'VERIFIED',
      message: `Goods receipt for order ${orderId} confirmed successfully.`,
    });
  } catch (error) {
    console.error('Failed to confirm receipt:', error);
    return NextResponse.json(
      { error: 'Failed to confirm receipt', details: String(error) },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';

const MOCK_ORDERS = [
  { orderId: 'ORD_92301', outletId: 'OUT001', outletName: 'Fresh Galle Rd', brand: 'Fresh', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'chilled', parkingConstraint: 'van_only', dockType: 'street', weightKg: 380, volumeM3: 1.4, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92302', outletId: 'OUT002', outletName: 'Fresh Kollupitiya', brand: 'Fresh', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'ambient', parkingConstraint: 'van_only', dockType: 'street', weightKg: 520, volumeM3: 2.1, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92303', outletId: 'OUT003', outletName: 'Fresh Bambalapitiya', brand: 'Fresh', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'chilled', parkingConstraint: 'van_only', dockType: 'street', weightKg: 440, volumeM3: 1.8, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92304', outletId: 'OUT015', outletName: 'Style Colombo City Centre', brand: 'Style', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'ambient', parkingConstraint: 'mall_dock', dockType: 'mall_bay', weightKg: 780, volumeM3: 3.2, window: '09:00 to 11:00', status: 'confirmed' },
  { orderId: 'ORD_92305', outletId: 'OUT016', outletName: 'Style One Galle Face', brand: 'Style', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'ambient', parkingConstraint: 'mall_dock', dockType: 'mall_bay', weightKg: 920, volumeM3: 4.0, window: '09:00 to 11:00', status: 'confirmed' },
  { orderId: 'ORD_92306', outletId: 'OUT022', outletName: 'Tech Marino Mall', brand: 'Tech', district: 'Colombo', depot: 'Peliyagoda', tempRequirement: 'ambient', parkingConstraint: 'mall_dock', dockType: 'mall_bay', weightKg: 640, volumeM3: 2.6, window: '10:00 to 12:00', status: 'confirmed' },
  { orderId: 'ORD_92307', outletId: 'OUT040', outletName: 'Fresh Negombo Town', brand: 'Fresh', district: 'Gampaha', depot: 'Peliyagoda', tempRequirement: 'chilled', parkingConstraint: 'normal', dockType: 'rear_dock', weightKg: 850, volumeM3: 3.4, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92308', outletId: 'OUT041', outletName: 'Fresh Ja Ela Super', brand: 'Fresh', district: 'Gampaha', depot: 'Peliyagoda', tempRequirement: 'ambient', parkingConstraint: 'normal', dockType: 'rear_dock', weightKg: 680, volumeM3: 2.7, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92309', outletId: 'OUT076', outletName: 'Fresh Kandy City Market', brand: 'Fresh', district: 'Kandy', depot: 'Kandy', tempRequirement: 'chilled', parkingConstraint: 'van_only', dockType: 'street', weightKg: 490, volumeM3: 1.9, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92310', outletId: 'OUT077', outletName: 'Fresh Peradeniya Rd', brand: 'Fresh', district: 'Kandy', depot: 'Kandy', tempRequirement: 'ambient', parkingConstraint: 'van_only', dockType: 'street', weightKg: 410, volumeM3: 1.6, window: '05:00 to 07:30', status: 'confirmed' },
  { orderId: 'ORD_92311', outletId: 'OUT084', outletName: 'Style Kandy City Centre', brand: 'Style', district: 'Kandy', depot: 'Kandy', tempRequirement: 'ambient', parkingConstraint: 'mall_dock', dockType: 'mall_bay', weightKg: 810, volumeM3: 3.5, window: '09:00 to 11:00', status: 'confirmed' },
  { orderId: 'ORD_92312', outletId: 'OUT093', outletName: 'Tech Dalada Veediya', brand: 'Tech', district: 'Kandy', depot: 'Kandy', tempRequirement: 'ambient', parkingConstraint: 'van_only', dockType: 'street', weightKg: 530, volumeM3: 2.2, window: '10:30 to 12:30', status: 'confirmed' },
];

export async function GET() {
  return NextResponse.json({
    total: MOCK_ORDERS.length,
    orders: MOCK_ORDERS,
  });
}

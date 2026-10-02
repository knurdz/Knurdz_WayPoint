export type UserRole = 'dispatcher' | 'loader' | 'driver' | 'store';

export type BrandType = 'Fresh' | 'Style' | 'Tech';

export type VehicleCategory = 'truck' | 'van';

export type TemperatureRequirement = 'ambient' | 'chilled';

export type VehicleStatusType = 'idle' | 'assigned' | 'in_transit' | 'maintenance';

export type OrderStatusType = 'draft' | 'confirmed' | 'allocated' | 'in_transit' | 'delivered' | 'deferred';

export type PlanningBucketType = 'next_day' | 'rollover';

export type StopStatusType = 'pending' | 'en_route' | 'arrived' | 'unloading' | 'completed' | 'exception';

export type DeferralCode = 'DEF_01' | 'DEF_02' | 'DEF_03' | 'DEF_04' | 'DEF_05' | 'DEF_06';

export interface OutletDto {
  outletId: string;
  brand: BrandType;
  district: string;
  depot: string;
  dockType: string;
  parkingConstraint: string;
  mallWindow: string;
  windowOpenTime: string;
  windowCloseTime: string;
}

export interface VehicleDto {
  vehicleId: string;
  type: VehicleCategory;
  temp: TemperatureRequirement;
  weightCapKg: number;
  volumeCapM3: number;
  fuelType: string;
  kmPerL: number;
  weeklyFuelQuotaL: number;
  depot: string;
}

export interface RagMetrics {
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
  timeBudgetRemainingMin: number;
  fuelQuotaRemainingL: number;
  status: 'green' | 'amber' | 'red';
  violations: string[];
}

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any, TypedDict

@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    passed: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TripEvaluation:
    is_valid: bool
    violations: List[str]
    rule_results: List[RuleResult]
    total_weight_kg: float
    total_volume_m3: float
    total_duration_min: float
    weight_utilization_pct: float
    volume_utilization_pct: float
    time_utilization_pct: float
    rag_status: str

class DistrictTravelInfo(TypedDict, total=False):
    depot_to_district_freeflow_min: float
    inter_stop_freeflow_min: float
    depot_to_district_km: float
    inter_stop_km: float

class OrderPayload(TypedDict, total=False):
    order_id: str
    outlet_id: str
    brand: str
    district: str
    depot: str
    temp_requirement: str
    temperature: str
    parking_constraint: str
    dock_type: str
    weight_kg: float
    volume_m3: float
    deferred_days: int
    unserved_consecutive_days: int

class VehiclePayload(TypedDict, total=False):
    vehicle_id: str
    type: str
    temp: str
    temperature: str
    weight_cap_kg: float
    volume_cap_m3: float
    fuel_type: str
    km_per_l: float
    weekly_fuel_quota_l: float
    depot: str

from typing import List, Dict, Tuple, Any, Optional
from .types import RuleResult, TripEvaluation
from .vehicle_rules import (
    check_vehicle_exists,
    check_vehicle_available,
    check_depot_alignment,
    check_cold_chain,
    check_parking_access,
    check_volume_capacity,
    check_weight_capacity,
)
from .trip_rules import check_trip_id_valid, check_brand_purity, check_district_purity
from .time_rules import compute_trip_duration, check_time_budget, TRIP_BUDGET_PREDAWN_MIN, TRIP_BUDGET_DAYTIME_MIN

def evaluate_trip(
    trip_id: int,
    vehicle: Dict[str, Any],
    orders: List[Dict[str, Any]],
    fleet_catalog: Optional[Dict[str, Any]] = None,
    fleet_status: Optional[Dict[str, str]] = None,
    scenario: str = "S1",
    district_travel_map: Optional[Dict[str, Dict[str, float]]] = None,
    service_allowance_map: Optional[Dict[Tuple[str, str], float]] = None,
) -> TripEvaluation:
    fleet_catalog = fleet_catalog or {}
    fleet_status = fleet_status or {}
    district_travel_map = district_travel_map or {}
    service_allowance_map = service_allowance_map or {}

    vid = vehicle.get("vehicle_id", "")
    vtype = vehicle.get("type", "truck")
    vtemp = vehicle.get("temp", "ambient")
    vdepot = vehicle.get("depot", "Peliyagoda")
    w_cap = float(vehicle.get("weight_cap_kg", 5000.0))
    v_cap = float(vehicle.get("volume_cap_m3", 20.0))

    rule_results: List[RuleResult] = []

    if fleet_catalog:
        rule_results.append(check_vehicle_exists(vid, fleet_catalog))

    if fleet_status:
        rule_results.append(check_vehicle_available(vid, scenario, fleet_status))

    rule_results.append(check_trip_id_valid(trip_id))

    brands = [o.get("brand", "") for o in orders]
    districts = [o.get("district", "") for o in orders]
    order_depots = [o.get("depot", vdepot) for o in orders]
    temp_reqs = [o.get("temp_requirement", "ambient") for o in orders]
    parking_constraints = [o.get("parking_constraint", "normal") for o in orders]
    dock_types = [o.get("dock_type", "street") for o in orders]

    rule_results.append(check_depot_alignment(vdepot, order_depots))
    rule_results.append(check_brand_purity(brands))
    rule_results.append(check_district_purity(districts))
    rule_results.append(check_cold_chain(vtemp, temp_reqs))
    rule_results.append(check_parking_access(vtype, parking_constraints))

    total_weight = sum(float(o.get("weight_kg", 0.0)) for o in orders)
    total_volume = sum(float(o.get("volume_m3", 0.0)) for o in orders)

    rule_results.append(check_volume_capacity(total_volume, v_cap))
    rule_results.append(check_weight_capacity(total_weight, w_cap))

    primary_district = districts[0] if districts else "Colombo"
    primary_brand = brands[0] if brands else "Fresh"
    total_duration = compute_trip_duration(
        primary_district,
        primary_brand,
        dock_types,
        district_travel_map,
        service_allowance_map
    )

    rule_results.append(check_time_budget(primary_brand, total_duration))

    failed = [r for r in rule_results if not r.passed]
    is_valid = len(failed) == 0
    violations = [f"{r.rule_id}: {r.message}" for r in failed]

    w_util = (total_weight / w_cap * 100.0) if w_cap > 0 else 0.0
    v_util = (total_volume / v_cap * 100.0) if v_cap > 0 else 0.0
    max_budget = TRIP_BUDGET_PREDAWN_MIN if primary_brand == "Fresh" else TRIP_BUDGET_DAYTIME_MIN
    t_util = (total_duration / max_budget * 100.0) if max_budget > 0 else 0.0

    if not is_valid or w_util > 100.0 or v_util > 100.0 or t_util > 100.0:
        rag_status = "RED"
    elif w_util >= 85.0 or v_util >= 85.0 or t_util >= 85.0:
        rag_status = "AMBER"
    else:
        rag_status = "GREEN"

    return TripEvaluation(
        is_valid=is_valid,
        violations=violations,
        rule_results=rule_results,
        total_weight_kg=total_weight,
        total_volume_m3=total_volume,
        total_duration_min=total_duration,
        weight_utilization_pct=round(w_util, 1),
        volume_utilization_pct=round(v_util, 1),
        time_utilization_pct=round(t_util, 1),
        rag_status=rag_status
    )

from typing import List, Dict, Tuple, Any
from .types import RuleResult

TRIP_BUDGET_PREDAWN_MIN = 270.0
TRIP_BUDGET_DAYTIME_MIN = 480.0

def compute_trip_duration(
    district: str,
    brand: str,
    dock_types: List[str],
    district_travel_map: Dict[str, Dict[str, float]],
    service_allowance_map: Dict[Tuple[str, str], float]
) -> float:
    n_stops = len(dock_types)
    if n_stops == 0:
        return 0.0

    travel_info = district_travel_map.get(district, {
        "depot_to_district_freeflow_min": 45.0,
        "inter_stop_freeflow_min": 15.0
    })

    depot_to_district = travel_info.get("depot_to_district_freeflow_min", 45.0)
    inter_stop = travel_info.get("inter_stop_freeflow_min", 15.0)

    total_service = sum(service_allowance_map.get((brand, dk), 20.0) for dk in dock_types)
    return depot_to_district + (n_stops - 1) * inter_stop + total_service

def check_time_budget(brand: str, total_duration_min: float) -> RuleResult:
    max_budget = TRIP_BUDGET_PREDAWN_MIN if brand == "Fresh" else TRIP_BUDGET_DAYTIME_MIN
    window_name = "Pre dawn 03:30 to 08:00 window" if brand == "Fresh" else "Daytime window"
    passed = total_duration_min <= max_budget + 0.000001
    msg = f"Duration {total_duration_min:.0f} min within {window_name} limit of {max_budget:.0f} min" if passed else f"Duration {total_duration_min:.0f} min exceeds {window_name} limit of {max_budget:.0f} min"
    return RuleResult(
        rule_id="R14",
        rule_name="Time Window Budget Limit",
        passed=passed,
        message=msg,
        details={"brand": brand, "duration_min": total_duration_min, "budget_min": max_budget}
    )

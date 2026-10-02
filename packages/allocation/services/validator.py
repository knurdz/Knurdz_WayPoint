from typing import Dict, Any, List, Optional
from rules import evaluate_trip
from .data_loader import load_vehicles_catalog, load_district_travel, load_service_allowances

FLEET_CATALOG = load_vehicles_catalog()
DISTRICT_TRAVEL = load_district_travel()
SERVICE_ALLOWANCES = load_service_allowances()

def validate_route_payload(trip_data: Dict[str, Any], vehicle_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    vid = trip_data.get("vehicle_id", "")
    veh = vehicle_data or FLEET_CATALOG.get(vid, {})

    if not veh:
        veh = {
            "vehicle_id": vid,
            "type": "truck",
            "temp": "ambient",
            "depot": "Peliyagoda",
            "weight_cap_kg": 5000.0,
            "volume_cap_m3": 20.0,
            "km_per_l": 4.5,
        }

    trip_id = int(trip_data.get("trip_id", 1))
    orders = trip_data.get("orders", [])
    scenario = trip_data.get("scenario", "S1")

    eval_result = evaluate_trip(
        trip_id=trip_id,
        vehicle=veh,
        orders=orders,
        fleet_catalog=FLEET_CATALOG,
        scenario=scenario,
        district_travel_map=DISTRICT_TRAVEL,
        service_allowance_map=SERVICE_ALLOWANCES
    )

    primary_district = orders[0].get("district", "Colombo") if orders else "Colombo"
    travel_info = DISTRICT_TRAVEL.get(primary_district, {"depot_to_district_km": 20.0, "inter_stop_km": 5.0})
    n_stops = len(orders)

    depot_dist = travel_info.get("depot_to_district_km", 20.0)
    inter_dist = travel_info.get("inter_stop_km", 5.0)
    total_km = (depot_dist * 2.0) + (max(0, n_stops - 1) * inter_dist) if n_stops > 0 else 0.0

    km_per_l = float(veh.get("km_per_l", 4.5))
    fuel_l = round(total_km / km_per_l, 2) if km_per_l > 0 else 0.0

    return {
        "is_valid": eval_result.is_valid,
        "violations": eval_result.violations,
        "metrics": {
            "total_weight_kg": eval_result.total_weight_kg,
            "total_volume_m3": eval_result.total_volume_m3,
            "total_duration_min": eval_result.total_duration_min,
            "fuel_consumed_l": fuel_l,
            "weight_utilization_pct": eval_result.weight_utilization_pct,
            "volume_utilization_pct": eval_result.volume_utilization_pct,
            "time_utilization_pct": eval_result.time_utilization_pct,
            "rag_status": eval_result.rag_status,
        }
    }

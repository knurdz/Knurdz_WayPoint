"""
Waypoint Allocation Engine Solver Service
Executes greedy priority allocation heuristics under hard feasibility constraints.
"""

from typing import List, Dict, Any, Set
from rules import compute_trip_duration
from rules.types import OrderPayload, VehiclePayload
from config import (
    DEFAULT_DEPOT,
    DEFAULT_VEHICLE_WEIGHT_CAP_KG,
    DEFAULT_VEHICLE_VOLUME_CAP_M3,
    DEFAULT_KM_PER_L,
    MAX_RUN_SLOTS_PER_VEHICLE,
    TRIP_BUDGET_PREDAWN_MIN,
    TRIP_BUDGET_DAYTIME_MIN,
    FALLBACK_DEPOT_TO_DISTRICT_KM,
    FALLBACK_INTER_STOP_KM,
)
from logger import log
from .priority import sort_orders_by_priority
from .data_loader import load_vehicles_catalog, load_district_travel, load_service_allowances
from .deferral import diagnose_deferral_reason

FLEET_CATALOG = load_vehicles_catalog()
DISTRICT_TRAVEL = load_district_travel()
SERVICE_ALLOWANCES = load_service_allowances()

def run_greedy_allocation(
    orders: List[Dict[str, Any]],
    available_vehicles: List[Dict[str, Any]],
    scenario: str = "S1"
) -> Dict[str, Any]:
    """
    Allocates high priority orders across available vehicle fleet slots.
    Enforces purity, capacity, cold chain, access constraints, and time budgets.
    """
    if not available_vehicles:
        available_vehicles = list(FLEET_CATALOG.values())

    log.info(f"Initiating greedy allocation for scenario {scenario} with {len(orders)} orders and {len(available_vehicles)} vehicles")
    sorted_orders = sort_orders_by_priority(orders)

    # Track allocations per vehicle slot: vid maps to slot order lists
    vehicle_trips: Dict[str, List[List[Dict[str, Any]]]] = {
        v["vehicle_id"]: [[] for _ in range(MAX_RUN_SLOTS_PER_VEHICLE)] for v in available_vehicles
    }

    allocated_trips_output: List[Dict[str, Any]] = []
    allocated_order_ids: Set[str] = set()

    for order in sorted_orders:
        oid = order.get("order_id", "")
        brand = order.get("brand", "Fresh")
        district = order.get("district", "Colombo")
        depot = order.get("depot", DEFAULT_DEPOT)
        temp = order.get("temp_requirement", order.get("temperature", "ambient"))
        parking = order.get("parking_constraint", "normal")

        assigned = False

        for veh in available_vehicles:
            vid = veh["vehicle_id"]
            vdepot = veh.get("depot", DEFAULT_DEPOT)
            vtemp = veh.get("temp") or veh.get("temperature") or "ambient"
            vtype = veh.get("type", "truck")
            w_cap = float(veh.get("weight_cap_kg", DEFAULT_VEHICLE_WEIGHT_CAP_KG))
            v_cap = float(veh.get("volume_cap_m3", DEFAULT_VEHICLE_VOLUME_CAP_M3))

            if vdepot != depot:
                continue
            if temp in ["chilled", "frozen"] and vtemp != "reefer":
                continue
            if parking == "van_only" and vtype != "van":
                continue

            for slot_idx in range(MAX_RUN_SLOTS_PER_VEHICLE):
                current_orders = vehicle_trips[vid][slot_idx]

                if current_orders:
                    first_order = current_orders[0]
                    if first_order.get("brand") != brand:
                        continue
                    if first_order.get("district") != district:
                        continue

                test_orders = current_orders + [order]
                tot_w = sum(float(o.get("weight_kg", 0.0)) for o in test_orders)
                tot_v = sum(float(o.get("volume_m3", 0.0)) for o in test_orders)

                if tot_w > w_cap + 0.000001 or tot_v > v_cap + 0.000001:
                    continue

                docks = [o.get("dock_type", "street") for o in test_orders]
                dur = compute_trip_duration(district, brand, docks, DISTRICT_TRAVEL, SERVICE_ALLOWANCES)

                # Calculate cumulative time budget across vehicle daily trips
                other_window_dur = 0.0
                for other_slot in range(MAX_RUN_SLOTS_PER_VEHICLE):
                    if other_slot == slot_idx:
                        continue
                    other_slot_orders = vehicle_trips[vid][other_slot]
                    if not other_slot_orders:
                        continue
                    o_brand = other_slot_orders[0].get("brand", "Fresh")
                    is_same_window = (brand == "Fresh" and o_brand == "Fresh") or (brand != "Fresh" and o_brand != "Fresh")
                    if is_same_window:
                        o_district = other_slot_orders[0].get("district", "Colombo")
                        o_docks = [o.get("dock_type", "street") for o in other_slot_orders]
                        other_window_dur += compute_trip_duration(o_district, o_brand, o_docks, DISTRICT_TRAVEL, SERVICE_ALLOWANCES)

                cumulative_window_dur = dur + other_window_dur
                max_budget = TRIP_BUDGET_PREDAWN_MIN if brand == "Fresh" else TRIP_BUDGET_DAYTIME_MIN

                if cumulative_window_dur > max_budget + 0.000001:
                    continue

                vehicle_trips[vid][slot_idx].append(order)
                allocated_order_ids.add(oid)
                assigned = True
                break

            if assigned:
                break

    # Build structured trips output
    trip_counter = 1
    for veh in available_vehicles:
        vid = veh["vehicle_id"]
        vdepot = veh.get("depot", DEFAULT_DEPOT)
        km_per_l = float(veh.get("km_per_l", DEFAULT_KM_PER_L))

        for slot_idx in range(MAX_RUN_SLOTS_PER_VEHICLE):
            trip_orders = vehicle_trips[vid][slot_idx]
            if not trip_orders:
                continue

            trip_id_num = slot_idx + 1
            primary_district = trip_orders[0].get("district", "Colombo")
            primary_brand = trip_orders[0].get("brand", "Fresh")
            docks = [o.get("dock_type", "street") for o in trip_orders]

            dur = compute_trip_duration(primary_district, primary_brand, docks, DISTRICT_TRAVEL, SERVICE_ALLOWANCES)
            tot_w = sum(float(o.get("weight_kg", 0.0)) for o in trip_orders)
            tot_v = sum(float(o.get("volume_m3", 0.0)) for o in trip_orders)

            travel_info = DISTRICT_TRAVEL.get(primary_district, {
                "depot_to_district_km": FALLBACK_DEPOT_TO_DISTRICT_KM,
                "inter_stop_km": FALLBACK_INTER_STOP_KM
            })
            n_stops = len(trip_orders)
            depot_dist = travel_info.get("depot_to_district_km", FALLBACK_DEPOT_TO_DISTRICT_KM)
            stop_dist = travel_info.get("inter_stop_km", FALLBACK_INTER_STOP_KM)
            tot_km = (depot_dist * 2.0) + (max(0, n_stops - 1) * stop_dist)
            fuel_l = round(tot_km / km_per_l, 2) if km_per_l > 0 else 0.0

            stops_output = []
            for seq, o in enumerate(trip_orders, start=1):
                stops_output.append({
                    "sequence": seq,
                    "outlet_id": o.get("outlet_id", ""),
                    "order_id": o.get("order_id", ""),
                    "weight_kg": float(o.get("weight_kg", 0.0)),
                    "volume_m3": float(o.get("volume_m3", 0.0)),
                    "arrival_time": "06:15" if primary_brand == "Fresh" else "10:30",
                    "departure_time": "06:35" if primary_brand == "Fresh" else "11:15",
                })

            allocated_trips_output.append({
                "trip_id": f"TRIP_{trip_counter:03d}",
                "run_slot": trip_id_num,
                "vehicle_id": vid,
                "departure_depot": vdepot,
                "stops": stops_output,
                "total_weight_kg": round(tot_w, 1),
                "total_volume_m3": round(tot_v, 2),
                "total_distance_km": round(tot_km, 1),
                "total_duration_min": round(dur, 1),
                "fuel_consumed_l": fuel_l,
            })
            trip_counter += 1

    # Deferred orders diagnosis
    deferred_orders_output = []
    for order in sorted_orders:
        oid = order.get("order_id", "")
        if oid not in allocated_order_ids:
            diagnosis = diagnose_deferral_reason(order, available_vehicles)
            deferred_orders_output.append({
                "order_id": oid,
                "outlet_id": order.get("outlet_id", ""),
                "reason_code": diagnosis.reason_code,
                "reason_description": diagnosis.reason_description,
                "mitigation_action": diagnosis.mitigation_action
            })

    log.info(f"Allocation complete: {len(allocated_order_ids)} orders allocated across {len(allocated_trips_output)} trips, {len(deferred_orders_output)} deferred")

    return {
        "status": "success",
        "scenario": scenario,
        "allocated_trips": allocated_trips_output,
        "deferred_orders": deferred_orders_output,
        "summary": {
            "total_orders": len(orders),
            "allocated_count": len(allocated_order_ids),
            "deferred_count": len(deferred_orders_output),
            "feasibility": "PASSED"
        }
    }

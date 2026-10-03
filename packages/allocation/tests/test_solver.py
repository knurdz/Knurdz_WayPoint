import pytest
from services.solver import run_greedy_allocation

def test_greedy_allocation_simple():
    orders = [
        {
            "order_id": "ORD001",
            "outlet_id": "OUT001",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temperature": "ambient",
            "weight_kg": 500.0,
            "volume_m3": 2.0,
            "dock_type": "street",
            "parking_constraint": "normal"
        },
        {
            "order_id": "ORD002",
            "outlet_id": "OUT002",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temperature": "ambient",
            "weight_kg": 600.0,
            "volume_m3": 2.5,
            "dock_type": "street",
            "parking_constraint": "normal"
        }
    ]
    vehicles = [
        {
            "vehicle_id": "VEH001",
            "type": "truck",
            "temp": "ambient",
            "depot": "Peliyagoda",
            "weight_cap_kg": 5000.0,
            "volume_cap_m3": 20.0,
            "km_per_l": 4.5
        }
    ]

    result = run_greedy_allocation(orders, vehicles, "S1")
    assert result["status"] == "success"
    assert result["summary"]["allocated_count"] == 2
    assert result["summary"]["deferred_count"] == 0
    assert len(result["allocated_trips"]) == 1
    trip = result["allocated_trips"][0]
    assert trip["vehicle_id"] == "VEH001"
    assert len(trip["stops"]) == 2
    assert trip["total_weight_kg"] == 1100.0

def test_greedy_allocation_cumulative_time_budget():
    # Galle outbound is 103 min plus handling
    # Matara outbound is 137 min plus handling
    # Combined duration exceeds Fresh 270 min pre dawn limit
    orders = [
        {
            "order_id": "ORD_GALLE",
            "outlet_id": "OUT_GALLE",
            "brand": "Fresh",
            "district": "Galle",
            "depot": "Peliyagoda",
            "temperature": "ambient",
            "weight_kg": 500.0,
            "volume_m3": 2.0,
            "dock_type": "street",
            "parking_constraint": "normal"
        },
        {
            "order_id": "ORD_MATARA",
            "outlet_id": "OUT_MATARA",
            "brand": "Fresh",
            "district": "Matara",
            "depot": "Peliyagoda",
            "temperature": "ambient",
            "weight_kg": 500.0,
            "volume_m3": 2.0,
            "dock_type": "street",
            "parking_constraint": "normal"
        }
    ]
    vehicles = [
        {
            "vehicle_id": "VEH001",
            "type": "truck",
            "temp": "ambient",
            "depot": "Peliyagoda",
            "weight_cap_kg": 5000.0,
            "volume_cap_m3": 20.0,
            "km_per_l": 4.5
        }
    ]

    result = run_greedy_allocation(orders, vehicles, "S1")
    assert result["status"] == "success"
    # One order allocated to Trip 1, second order deferred because cumulative Fresh time exceeds 270 min
    assert result["summary"]["allocated_count"] == 1
    assert result["summary"]["deferred_count"] == 1
    assert result["deferred_orders"][0]["reason_code"] == "TIME_BUDGET"

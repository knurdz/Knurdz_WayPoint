from typing import Dict, Any, List
from rules.runner import evaluate_trip
from rules.types import TripEvaluation

def test_allocation_full_pass():
    vehicle = {
        "vehicle_id": "VEH037",
        "type": "truck",
        "temp": "reefer",
        "depot": "Peliyagoda",
        "weight_cap_kg": 5000.0,
        "volume_cap_m3": 20.0,
    }
    orders = [
        {
            "order_id": "ORD001",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "chilled",
            "parking_constraint": "normal",
            "dock_type": "ramp",
            "weight_kg": 1500.0,
            "volume_m3": 6.0,
        },
        {
            "order_id": "ORD002",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "chilled",
            "parking_constraint": "normal",
            "dock_type": "ground",
            "weight_kg": 1200.0,
            "volume_m3": 5.0,
        },
    ]

    evaluation = evaluate_trip(
        trip_id=1,
        vehicle=vehicle,
        orders=orders,
    )

    assert evaluation.is_valid is True
    assert len(evaluation.violations) == 0
    assert evaluation.total_weight_kg == 2700.0
    assert evaluation.total_volume_m3 == 11.0
    assert evaluation.rag_status in ["GREEN", "AMBER"]

def test_allocation_weight_capacity_violation():
    vehicle = {
        "vehicle_id": "VEH001",
        "type": "van",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 1000.0,
        "volume_cap_m3": 10.0,
    }
    orders = [
        {
            "order_id": "ORD003",
            "brand": "Express",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "ambient",
            "parking_constraint": "normal",
            "dock_type": "street",
            "weight_kg": 1500.0,
            "volume_m3": 4.0,
        }
    ]

    evaluation = evaluate_trip(
        trip_id=1,
        vehicle=vehicle,
        orders=orders,
    )

    assert evaluation.is_valid is False
    assert any("weight" in v.lower() for v in evaluation.violations)
    assert evaluation.rag_status == "RED"

def test_allocation_volume_capacity_violation():
    vehicle = {
        "vehicle_id": "VEH002",
        "type": "van",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 2000.0,
        "volume_cap_m3": 5.0,
    }
    orders = [
        {
            "order_id": "ORD004",
            "brand": "Express",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "ambient",
            "parking_constraint": "normal",
            "dock_type": "street",
            "weight_kg": 400.0,
            "volume_m3": 8.0,
        }
    ]

    evaluation = evaluate_trip(
        trip_id=1,
        vehicle=vehicle,
        orders=orders,
    )

    assert evaluation.is_valid is False
    assert any("volume" in v.lower() for v in evaluation.violations)
    assert evaluation.rag_status == "RED"

def test_allocation_cold_chain_violation():
    vehicle = {
        "vehicle_id": "VEH003",
        "type": "truck",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 4000.0,
        "volume_cap_m3": 15.0,
    }
    orders = [
        {
            "order_id": "ORD005",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "frozen",
            "parking_constraint": "normal",
            "dock_type": "ramp",
            "weight_kg": 500.0,
            "volume_m3": 2.0,
        }
    ]

    evaluation = evaluate_trip(
        trip_id=1,
        vehicle=vehicle,
        orders=orders,
    )

    assert evaluation.is_valid is False
    assert any("refrigerated" in v.lower() or "cold" in v.lower() or "r10" in v.lower() for v in evaluation.violations)

def test_allocation_van_only_street_access():
    truck_vehicle = {
        "vehicle_id": "VEH004",
        "type": "truck",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 6000.0,
        "volume_cap_m3": 24.0,
    }
    orders = [
        {
            "order_id": "ORD006",
            "brand": "Express",
            "district": "Kandy",
            "depot": "Peliyagoda",
            "temp_requirement": "ambient",
            "parking_constraint": "van_only",
            "dock_type": "street",
            "weight_kg": 600.0,
            "volume_m3": 2.5,
        }
    ]

    eval_truck = evaluate_trip(
        trip_id=1,
        vehicle=truck_vehicle,
        orders=orders,
    )
    assert eval_truck.is_valid is False
    assert any("van" in v.lower() for v in eval_truck.violations)

    van_vehicle = {
        "vehicle_id": "VEH005",
        "type": "van",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 1500.0,
        "volume_cap_m3": 6.0,
    }
    eval_van = evaluate_trip(
        trip_id=1,
        vehicle=van_vehicle,
        orders=orders,
    )
    assert eval_van.is_valid is True

def test_allocation_brand_and_district_purity():
    vehicle = {
        "vehicle_id": "VEH006",
        "type": "truck",
        "temp": "ambient",
        "depot": "Peliyagoda",
        "weight_cap_kg": 5000.0,
        "volume_cap_m3": 20.0,
    }
    mixed_orders = [
        {
            "order_id": "ORD007",
            "brand": "Fresh",
            "district": "Colombo",
            "depot": "Peliyagoda",
            "temp_requirement": "ambient",
            "parking_constraint": "normal",
            "dock_type": "street",
            "weight_kg": 300.0,
            "volume_m3": 1.0,
        },
        {
            "order_id": "ORD008",
            "brand": "Express",
            "district": "Gampaha",
            "depot": "Peliyagoda",
            "temp_requirement": "ambient",
            "parking_constraint": "normal",
            "dock_type": "street",
            "weight_kg": 400.0,
            "volume_m3": 1.2,
        },
    ]

    evaluation = evaluate_trip(
        trip_id=1,
        vehicle=vehicle,
        orders=mixed_orders,
    )
    assert evaluation.is_valid is False
    assert any("brand" in v.lower() for v in evaluation.violations)
    assert any("district" in v.lower() for v in evaluation.violations)

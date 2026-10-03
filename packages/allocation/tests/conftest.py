import pytest
from typing import Dict, Any, List

@pytest.fixture
def mock_trip_candidate() -> Dict[str, Any]:
    return {
        "vehicle_id": "VEH037",
        "vehicle_type": "reefer",
        "max_payload_kg": 3200.0,
        "max_volume_m3": 14.5,
        "is_reefer": True,
        "departure_minute": 240,
        "trip_duration_min": 210.0,
        "fuel_consumption_litres": 32.5,
        "fuel_tank_capacity": 80.0,
        "orders": [
            {
                "order_id": "ORD001",
                "outlet_id": "OUT001",
                "weight_kg": 850.0,
                "volume_m3": 3.2,
                "is_chilled": True,
                "is_frozen": False,
                "requires_van": False,
                "arrival_minute": 280,
                "dock_window_start": 240,
                "dock_window_end": 720,
            },
            {
                "order_id": "ORD002",
                "outlet_id": "OUT002",
                "weight_kg": 1100.0,
                "volume_m3": 4.5,
                "is_chilled": False,
                "is_frozen": True,
                "requires_van": False,
                "arrival_minute": 360,
                "dock_window_start": 300,
                "dock_window_end": 720,
            },
        ],
    }

@pytest.fixture
def mock_van_trip_candidate() -> Dict[str, Any]:
    return {
        "vehicle_id": "VEH005",
        "vehicle_type": "van",
        "max_payload_kg": 1200.0,
        "max_volume_m3": 6.0,
        "is_reefer": False,
        "departure_minute": 300,
        "trip_duration_min": 180.0,
        "fuel_consumption_litres": 18.0,
        "fuel_tank_capacity": 60.0,
        "orders": [
            {
                "order_id": "ORD015",
                "outlet_id": "OUT015",
                "weight_kg": 500.0,
                "volume_m3": 2.1,
                "is_chilled": False,
                "is_frozen": False,
                "requires_van": True,
                "arrival_minute": 340,
                "dock_window_start": 300,
                "dock_window_end": 600,
            }
        ],
    }

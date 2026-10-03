"""
Automated Integration Tests for Waypoint Allocation Engine FastAPI Endpoints
Tests health probes, optimization heuristic solver endpoints, and candidate validation.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check_endpoint():
    """
    Verifies service health check probe returns 200 with healthy status.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "waypoint_allocation"
    assert data["version"] == "1.0.0"

def test_root_endpoint():
    """
    Verifies root endpoint returns readiness status.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"

def test_optimize_endpoint_basic():
    """
    Verifies optimize endpoint accepts valid orders and returns structured trips.
    """
    payload = {
        "scenario": "S1",
        "delivery_date": "2026_03_01",
        "orders": [
            {
                "order_id": "ORD_API_001",
                "outlet_id": "OUT001",
                "brand": "Fresh",
                "district": "Colombo",
                "depot": "Peliyagoda",
                "temperature": "chilled",
                "weight_kg": 250.0,
                "volume_m3": 1.2,
                "dock_type": "street",
                "parking_constraint": "normal"
            }
        ],
        "vehicles": [
            {
                "vehicle_id": "VEH_API_001",
                "type": "truck",
                "temperature": "reefer",
                "weight_cap_kg": 4000.0,
                "volume_cap_m3": 18.0,
                "km_per_l": 4.5,
                "weekly_fuel_quota_l": 300.0,
                "depot": "Peliyagoda"
            }
        ]
    }
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["summary"]["allocated_count"] == 1
    assert data["summary"]["deferred_count"] == 0
    assert len(data["allocated_trips"]) == 1

def test_validate_candidate_trip_endpoint():
    """
    Verifies candidate trip validation returns metrics and RAG status.
    """
    payload = {
        "trip_id": 1,
        "vehicle_id": "VEH001",
        "scenario": "S1",
        "orders": [
            {
                "order_id": "ORD_001",
                "outlet_id": "OUT001",
                "brand": "Fresh",
                "district": "Colombo",
                "depot": "Peliyagoda",
                "temp_requirement": "ambient",
                "parking_constraint": "normal",
                "dock_type": "street",
                "weight_kg": 500.0,
                "volume_m3": 2.0
            }
        ],
        "vehicle": {
            "vehicle_id": "VEH001",
            "type": "truck",
            "temp": "ambient",
            "depot": "Peliyagoda",
            "weight_cap_kg": 5000.0,
            "volume_cap_m3": 20.0
        }
    }
    response = client.post("/api/v1/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["metrics"]["rag_status"] in ["GREEN", "AMBER", "RED"]

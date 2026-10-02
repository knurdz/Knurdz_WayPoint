import pytest
from services.deferral import diagnose_deferral_reason

def test_deferral_reefer_shortfall():
    order = {
        "order_id": "ORD001",
        "outlet_id": "OUT001",
        "brand": "Fresh",
        "depot": "Peliyagoda",
        "temp_requirement": "chilled",
        "parking_constraint": "normal"
    }
    # Only ambient vehicles available at Peliyagoda
    available_vehicles = [
        {"vehicle_id": "VEH001", "type": "truck", "temp": "ambient", "depot": "Peliyagoda"}
    ]
    diag = diagnose_deferral_reason(order, available_vehicles)
    assert diag.reason_code == "DEF_02"
    assert "reefer" in diag.reason_description.lower()

def test_deferral_van_only_restriction():
    order = {
        "order_id": "ORD002",
        "outlet_id": "OUT002",
        "brand": "Style",
        "depot": "Peliyagoda",
        "temp_requirement": "ambient",
        "parking_constraint": "van_only"
    }
    # Only trucks available
    available_vehicles = [
        {"vehicle_id": "VEH001", "type": "truck", "temp": "ambient", "depot": "Peliyagoda"}
    ]
    diag = diagnose_deferral_reason(order, available_vehicles)
    assert diag.reason_code == "DEF_03"
    assert "van" in diag.reason_description.lower()

def test_deferral_late_cutoff_rollover():
    order = {"order_id": "ORD003"}
    diag = diagnose_deferral_reason(order, [], is_late_order=True)
    assert diag.reason_code == "DEF_06"
    assert "16:00" in diag.reason_description

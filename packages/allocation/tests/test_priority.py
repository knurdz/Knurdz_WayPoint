import pytest
from services.priority import compute_order_priority, sort_orders_by_priority

def test_priority_deferred_highest():
    ord_normal = {"order_id": "O1", "deferred_yesterday": False, "days_since_last_served": 1, "temp_requirement": "ambient"}
    ord_deferred = {"order_id": "O2", "deferred_yesterday": True, "days_since_last_served": 1, "temp_requirement": "ambient"}
    ord_chilled = {"order_id": "O3", "deferred_yesterday": False, "days_since_last_served": 1, "temp_requirement": "chilled"}

    score_normal = compute_order_priority(ord_normal)
    score_deferred = compute_order_priority(ord_deferred)
    score_chilled = compute_order_priority(ord_chilled)

    assert score_deferred > score_chilled
    assert score_chilled > score_normal
    assert score_deferred == 1100.0
    assert score_chilled == 150.0
    assert score_normal == 100.0

def test_sorting_queue():
    orders = [
        {"order_id": "O1", "deferred_yesterday": False, "days_since_last_served": 1},
        {"order_id": "O2", "deferred_yesterday": True, "days_since_last_served": 1},
        {"order_id": "O3", "deferred_yesterday": False, "days_since_last_served": 3},
    ]
    sorted_queue = sort_orders_by_priority(orders)
    assert sorted_queue[0]["order_id"] == "O2"
    assert sorted_queue[1]["order_id"] == "O3"
    assert sorted_queue[2]["order_id"] == "O1"

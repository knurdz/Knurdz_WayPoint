from typing import Dict, Any, List

WEIGHT_DEFERRED_YESTERDAY = 1000.0
WEIGHT_UNSERVED_DAY = 100.0
WEIGHT_CHILLED = 50.0

def compute_order_priority(order: Dict[str, Any]) -> float:
    deferred_yesterday = 1.0 if (order.get("deferred_yesterday", False) or order.get("deferred_days", 0) > 0) else 0.0
    days_unserved = float(order.get("days_since_last_served", order.get("unserved_consecutive_days", 1)))
    is_chilled = 1.0 if order.get("temp_requirement", order.get("temperature", "ambient")) == "chilled" else 0.0

    score = (
        deferred_yesterday * WEIGHT_DEFERRED_YESTERDAY +
        days_unserved * WEIGHT_UNSERVED_DAY +
        is_chilled * WEIGHT_CHILLED
    )
    return score

def sort_orders_by_priority(orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return sorted(orders, key=lambda o: compute_order_priority(o), reverse=True)

"""
Waypoint Feasibility Engine Vehicle Rules
Validates fleet existence, maintenance availability, cold chain, access constraints, and payload capacities.
"""

from typing import Dict, Any, List
from .types import RuleResult

def check_vehicle_exists(vehicle_id: str, fleet_catalog: Dict[str, Any]) -> RuleResult:
    """
    Verifies that the assigned vehicle exists within the registered master fleet catalog.
    """
    passed = vehicle_id in fleet_catalog
    msg = "Vehicle exists in fleet catalog" if passed else f"Unknown vehicle id {vehicle_id}"
    return RuleResult(
        rule_id="R04",
        rule_name="Vehicle Catalog Existence",
        passed=passed,
        message=msg,
        details={"vehicle_id": vehicle_id}
    )

def check_vehicle_available(vehicle_id: str, scenario: str, fleet_status: Dict[str, str]) -> RuleResult:
    """
    Verifies that the vehicle is operational and not scheduled for workshop maintenance.
    """
    status = fleet_status.get(vehicle_id, "available")
    passed = status == "available"
    msg = "Vehicle available for dispatch" if passed else f"Vehicle {vehicle_id} is in workshop on {scenario}"
    return RuleResult(
        rule_id="R06",
        rule_name="Vehicle Workshop Availability",
        passed=passed,
        message=msg,
        details={"vehicle_id": vehicle_id, "status": status}
    )

def check_depot_alignment(vehicle_depot: str, order_depots: List[str]) -> RuleResult:
    """
    Ensures that all assigned orders originate from the vehicle home base depot.
    """
    unique_depots = set(order_depots)
    passed = len(unique_depots) <= 1 and (len(unique_depots) == 0 or list(unique_depots)[0] == vehicle_depot)
    msg = "Trip orders match vehicle base depot" if passed else f"Vehicle based at {vehicle_depot} but assigned orders for {list(unique_depots)}"
    return RuleResult(
        rule_id="R07",
        rule_name="Depot Geographic Alignment",
        passed=passed,
        message=msg,
        details={"vehicle_depot": vehicle_depot, "order_depots": list(unique_depots)}
    )

def check_cold_chain(vehicle_temp: str, temp_requirements: List[str]) -> RuleResult:
    """
    Ensures that chilled or frozen orders are dispatched exclusively on refrigerated reefer units.
    """
    has_frozen = any(t == "frozen" for t in temp_requirements)
    has_chilled = any(t == "chilled" for t in temp_requirements)
    has_cold = has_frozen or has_chilled

    is_cold_capable = vehicle_temp in ["reefer", "freezer", "frozen"]
    passed = not has_cold or is_cold_capable
    msg = "Cold chain integrity preserved" if passed else "Carries refrigerated orders on non refrigerated vehicle"
    return RuleResult(
        rule_id="R10",
        rule_name="Cold Chain Temperature Compliance",
        passed=passed,
        message=msg,
        details={"vehicle_temp": vehicle_temp, "has_cold": has_cold, "has_frozen": has_frozen, "has_chilled": has_chilled}
    )

def check_parking_access(vehicle_type: str, parking_constraints: List[str]) -> RuleResult:
    """
    Verifies that van only restricted retail outlets are not assigned heavy rigid trucks.
    """
    has_van_only = any(p == "van_only" for p in parking_constraints)
    passed = not has_van_only or vehicle_type == "van"
    msg = "Vehicle size matches outlet access" if passed else f"Sends {vehicle_type} to van only outlet"
    return RuleResult(
        rule_id="R11",
        rule_name="Outlet Parking Access Feasibility",
        passed=passed,
        message=msg,
        details={"vehicle_type": vehicle_type, "has_van_only": has_van_only}
    )

def check_volume_capacity(total_volume_m3: float, volume_cap_m3: float) -> RuleResult:
    """
    Validates that total order cubic meter volume does not breach vehicle volume capacity.
    """
    passed = total_volume_m3 <= volume_cap_m3 + 0.000001
    msg = "Volume within vehicle capacity" if passed else f"Volume {total_volume_m3:.1f} m3 exceeds capacity {volume_cap_m3:.1f} m3"
    return RuleResult(
        rule_id="R12",
        rule_name="Volumetric Capacity Limit",
        passed=passed,
        message=msg,
        details={"total_volume_m3": total_volume_m3, "volume_cap_m3": volume_cap_m3}
    )

def check_weight_capacity(total_weight_kg: float, weight_cap_kg: float) -> RuleResult:
    """
    Validates that total order payload weight in kg does not breach vehicle weight rating.
    """
    passed = total_weight_kg <= weight_cap_kg + 0.000001
    msg = "Payload weight within vehicle capacity" if passed else f"Weight {total_weight_kg:.0f} kg exceeds capacity {weight_cap_kg:.0f} kg"
    return RuleResult(
        rule_id="R13",
        rule_name="Payload Weight Capacity Limit",
        passed=passed,
        message=msg,
        details={"total_weight_kg": total_weight_kg, "weight_cap_kg": weight_cap_kg}
    )

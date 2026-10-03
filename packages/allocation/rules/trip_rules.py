"""
Waypoint Feasibility Engine Trip Rules
Enforces trip run sequencing, brand operational purity, and district geographical purity.
"""

from typing import List
from .types import RuleResult

def check_trip_id_valid(trip_id: int) -> RuleResult:
    """
    Validates that the trip slot number is within daily operational limits (1 or 2).
    """
    passed = trip_id in (1, 2)
    msg = "Trip sequence valid" if passed else f"Trip id must be 1 or 2, received {trip_id}"
    return RuleResult(
        rule_id="R05",
        rule_name="Trip Number Permissibility",
        passed=passed,
        message=msg,
        details={"trip_id": trip_id}
    )

def check_brand_purity(brands: List[str]) -> RuleResult:
    """
    Ensures orders in a single trip belong exclusively to a single brand retail stream.
    """
    unique_brands = set(brands)
    passed = len(unique_brands) <= 1
    msg = "Single brand purity maintained" if passed else f"Trip mixes brands: {sorted(list(unique_brands))} (one brand per trip rule)"
    return RuleResult(
        rule_id="R08",
        rule_name="Brand Operational Purity",
        passed=passed,
        message=msg,
        details={"brands": sorted(list(unique_brands))}
    )

def check_district_purity(districts: List[str]) -> RuleResult:
    """
    Ensures orders in a single trip are confined to a single geographic district.
    """
    unique_districts = set(districts)
    passed = len(unique_districts) <= 1
    msg = "District geographic purity maintained" if passed else f"Trip mixes districts: {sorted(list(unique_districts))} (one district per trip rule)"
    return RuleResult(
        rule_id="R09",
        rule_name="District Route Purity",
        passed=passed,
        message=msg,
        details={"districts": sorted(list(unique_districts))}
    )

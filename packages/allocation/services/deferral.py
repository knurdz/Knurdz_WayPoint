from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class DeferralDiagnosis:
    reason_code: str
    reason_description: str
    mitigation_action: str

DEFERRAL_CATALOG: Dict[str, Dict[str, str]] = {
    "WEIGHT_VOLUME": {
        "description": "Fleet capacity exhausted for designated district and time window",
        "mitigation": "Reschedule to next business day morning run or dispatch auxiliary carrier",
    },
    "REEFER_CAPACITY": {
        "description": "Chilled reefer vehicle capacity saturated across active fleet",
        "mitigation": "Prioritize on subsequent reefer run or transfer to Kandy depot reefer unit",
    },
    "VAN_ONLY": {
        "description": "Van only physical access restriction with no available van units",
        "mitigation": "Allocate dedicated van run or reschedule to low traffic off peak hours",
    },
    "MALL_WINDOW": {
        "description": "Mall docking window conflict or restricted access time elapsed",
        "mitigation": "Request emergency docking extension or stage for next morning mall window",
    },
    "TIME_BUDGET": {
        "description": "Pre dawn 03:30 to 08:00 delivery budget exceeded (270 min limit)",
        "mitigation": "Split multi stop run or consolidate drop sequence with adjacent outlet",
    },
    "CUTOFF_ROLLOVER": {
        "description": "Post 16:00 SLST order cutoff rollover to next operational cycle",
        "mitigation": "Automatically queue order for next day priority allocation bucket",
    },
}

# Shorthand aliases for backwards compatibility
DEFERRAL_CATALOG["DEF_01"] = DEFERRAL_CATALOG["WEIGHT_VOLUME"]
DEFERRAL_CATALOG["DEF_02"] = DEFERRAL_CATALOG["REEFER_CAPACITY"]
DEFERRAL_CATALOG["DEF_03"] = DEFERRAL_CATALOG["VAN_ONLY"]
DEFERRAL_CATALOG["DEF_04"] = DEFERRAL_CATALOG["MALL_WINDOW"]
DEFERRAL_CATALOG["DEF_05"] = DEFERRAL_CATALOG["TIME_BUDGET"]
DEFERRAL_CATALOG["DEF_06"] = DEFERRAL_CATALOG["CUTOFF_ROLLOVER"]

def diagnose_deferral_reason(
    order: Dict[str, Any],
    available_vehicles: List[Dict[str, Any]],
    is_late_order: bool = False
) -> DeferralDiagnosis:
    if is_late_order:
        info = DEFERRAL_CATALOG["CUTOFF_ROLLOVER"]
        return DeferralDiagnosis(
            reason_code="CUTOFF_ROLLOVER",
            reason_description=info["description"],
            mitigation_action=info["mitigation"]
        )

    temp_req = order.get("temp_requirement", order.get("temperature", "ambient"))
    parking = order.get("parking_constraint", "normal")
    depot = order.get("depot", "Peliyagoda")
    brand = order.get("brand", "Fresh")

    matching_depot_vehs = [v for v in available_vehicles if v.get("depot", "Peliyagoda") == depot]

    if temp_req == "chilled":
        reefer_vehs = [v for v in matching_depot_vehs if v.get("temp") == "reefer"]
        if not reefer_vehs:
            info = DEFERRAL_CATALOG["REEFER_CAPACITY"]
            return DeferralDiagnosis(
                reason_code="REEFER_CAPACITY",
                reason_description=info["description"],
                mitigation_action=info["mitigation"]
            )

    if parking == "van_only":
        van_vehs = [v for v in matching_depot_vehs if v.get("type") == "van"]
        if not van_vehs:
            info = DEFERRAL_CATALOG["VAN_ONLY"]
            return DeferralDiagnosis(
                reason_code="VAN_ONLY",
                reason_description=info["description"],
                mitigation_action=info["mitigation"]
            )

    if brand == "Fresh":
        info = DEFERRAL_CATALOG["TIME_BUDGET"]
        return DeferralDiagnosis(
            reason_code="TIME_BUDGET",
            reason_description=info["description"],
            mitigation_action=info["mitigation"]
        )

    info = DEFERRAL_CATALOG["WEIGHT_VOLUME"]
    return DeferralDiagnosis(
        reason_code="WEIGHT_VOLUME",
        reason_description=info["description"],
        mitigation_action=info["mitigation"]
    )

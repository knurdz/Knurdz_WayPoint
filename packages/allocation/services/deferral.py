from typing import Dict, Any, List
from dataclasses import dataclass

@dataclass
class DeferralDiagnosis:
    reason_code: str
    reason_description: str
    mitigation_action: str

DEFERRAL_CATALOG: Dict[str, Dict[str, str]] = {
    "DEF_01": {
        "description": "Fleet capacity exhausted for designated district and time window",
        "mitigation": "Reschedule to next business day morning run or dispatch auxiliary carrier",
    },
    "DEF_02": {
        "description": "Chilled reefer vehicle capacity saturated across active fleet",
        "mitigation": "Prioritize on subsequent reefer run or transfer to Kandy depot reefer unit",
    },
    "DEF_03": {
        "description": "Van only physical access restriction with no available van units",
        "mitigation": "Allocate dedicated van run or reschedule to low traffic off peak hours",
    },
    "DEF_04": {
        "description": "Mall docking window conflict or restricted access time elapsed",
        "mitigation": "Request emergency docking extension or stage for next morning mall window",
    },
    "DEF_05": {
        "description": "Pre dawn 03:30 to 08:00 delivery budget exceeded (270 min limit)",
        "mitigation": "Split multi stop run or consolidate drop sequence with adjacent outlet",
    },
    "DEF_06": {
        "description": "Post 16:00 SLST order cutoff rollover to next operational cycle",
        "mitigation": "Automatically queue order for next day priority allocation bucket",
    },
}

def diagnose_deferral_reason(
    order: Dict[str, Any],
    available_vehicles: List[Dict[str, Any]],
    is_late_order: bool = False
) -> DeferralDiagnosis:
    if is_late_order:
        info = DEFERRAL_CATALOG["DEF_06"]
        return DeferralDiagnosis(
            reason_code="DEF_06",
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
            info = DEFERRAL_CATALOG["DEF_02"]
            return DeferralDiagnosis(
                reason_code="DEF_02",
                reason_description=info["description"],
                mitigation_action=info["mitigation"]
            )

    if parking == "van_only":
        van_vehs = [v for v in matching_depot_vehs if v.get("type") == "van"]
        if not van_vehs:
            info = DEFERRAL_CATALOG["DEF_03"]
            return DeferralDiagnosis(
                reason_code="DEF_03",
                reason_description=info["description"],
                mitigation_action=info["mitigation"]
            )

    if brand == "Fresh":
        info = DEFERRAL_CATALOG["DEF_05"]
        return DeferralDiagnosis(
            reason_code="DEF_05",
            reason_description=info["description"],
            mitigation_action=info["mitigation"]
        )

    info = DEFERRAL_CATALOG["DEF_01"]
    return DeferralDiagnosis(
        reason_code="DEF_01",
        reason_description=info["description"],
        mitigation_action=info["mitigation"]
    )

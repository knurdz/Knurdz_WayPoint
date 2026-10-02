import os
import pandas as pd
from typing import Dict, Any, Tuple

def find_data_file(filename: str) -> str:
    possible_roots = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data"),
        os.path.abspath("data"),
    ]
    for root in possible_roots:
        target = os.path.join(root, filename)
        if os.path.exists(target):
            return target
    return ""

def load_vehicles_catalog() -> Dict[str, Dict[str, Any]]:
    path = find_data_file("vehicles.csv")
    if not path or not os.path.exists(path):
        return {}
    df = pd.read_csv(path)
    return {row["vehicle_id"]: row.to_dict() for _, row in df.iterrows()}

def load_district_travel() -> Dict[str, Dict[str, float]]:
    path = find_data_file("district_travel.csv")
    if not path or not os.path.exists(path):
        return {}
    df = pd.read_csv(path)
    result = {}
    for _, row in df.iterrows():
        result[row["district"]] = {
            "depot_to_district_freeflow_min": float(row["depot_to_district_freeflow_min"]),
            "inter_stop_freeflow_min": float(row["inter_stop_freeflow_min"]),
            "depot_to_district_km": float(row.get("depot_to_district_km", 20.0)),
            "inter_stop_km": float(row.get("inter_stop_km", 5.0)),
        }
    return result

def load_service_allowances() -> Dict[Tuple[str, str], float]:
    path = find_data_file("service_allowance.csv")
    if not path or not os.path.exists(path):
        return {}
    df = pd.read_csv(path)
    return {(row["brand"], row["dock_type"]): float(row["service_allowance_min"]) for _, row in df.iterrows()}

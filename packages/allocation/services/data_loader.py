"""
Waypoint Logistics Data Loader Service
Reads and parses fleet catalog, travel times, and dock service allowances from CSV.
"""

import os
import pandas as pd
from typing import Dict, Tuple
from rules.types import DistrictTravelInfo, VehiclePayload
from logger import log
from config import (
    FALLBACK_DEPOT_TO_DISTRICT_KM,
    FALLBACK_INTER_STOP_KM,
)

def find_data_file(filename: str) -> str:
    """
    Locates a CSV data file across standard project root paths.
    """
    possible_roots = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../data"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data"),
        os.path.abspath("data"),
    ]
    for root in possible_roots:
        target = os.path.join(root, filename)
        if os.path.exists(target):
            return target
    log.warning(f"Data file not located: {filename}")
    return ""

def load_vehicles_catalog() -> Dict[str, VehiclePayload]:
    """
    Parses vehicles catalog from CSV into structured vehicle records.
    """
    path = find_data_file("vehicles.csv")
    if not path or not os.path.exists(path):
        log.warning("Vehicles catalog file absent, using empty catalog fallback")
        return {}
    df = pd.read_csv(path)
    return {str(row["vehicle_id"]): VehiclePayload(**row.to_dict()) for _, row in df.iterrows()}

def load_district_travel() -> Dict[str, DistrictTravelInfo]:
    """
    Parses district travel matrix including depot travel times and stop gaps.
    """
    path = find_data_file("district_travel.csv")
    if not path or not os.path.exists(path):
        log.warning("District travel file absent, using fallback matrix")
        return {}
    df = pd.read_csv(path)
    result: Dict[str, DistrictTravelInfo] = {}
    for _, row in df.iterrows():
        result[str(row["district"])] = DistrictTravelInfo(
            depot_to_district_freeflow_min=float(row["depot_to_district_freeflow_min"]),
            inter_stop_freeflow_min=float(row["inter_stop_freeflow_min"]),
            depot_to_district_km=float(row.get("depot_to_district_km", FALLBACK_DEPOT_TO_DISTRICT_KM)),
            inter_stop_km=float(row.get("inter_stop_km", FALLBACK_INTER_STOP_KM)),
        )
    return result

def load_service_allowances() -> Dict[Tuple[str, str], float]:
    """
    Parses unloading dock duration allowances indexed by brand and dock category.
    """
    path = find_data_file("service_allowance.csv")
    if not path or not os.path.exists(path):
        log.warning("Service allowances file absent, using empty dock map")
        return {}
    df = pd.read_csv(path)
    return {
        (str(row["brand"]), str(row["dock_type"])): float(row["service_allowance_min"])
        for _, row in df.iterrows()
    }

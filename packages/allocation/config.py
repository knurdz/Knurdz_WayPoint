"""
Waypoint Allocation Engine Configuration Module
Centralized logistics configuration constants for Tech Triathlon 2026.
"""

from typing import Final

DEFAULT_DEPOT: Final[str] = "Peliyagoda"
SECONDARY_DEPOT: Final[str] = "Kandy"

DEFAULT_VEHICLE_WEIGHT_CAP_KG: Final[float] = 5000.0
DEFAULT_VEHICLE_VOLUME_CAP_M3: Final[float] = 20.0
DEFAULT_KM_PER_L: Final[float] = 4.5
DEFAULT_WEEKLY_FUEL_QUOTA_L: Final[float] = 300.0

FALLBACK_DEPOT_TO_DISTRICT_KM: Final[float] = 20.0
FALLBACK_INTER_STOP_KM: Final[float] = 5.0
FALLBACK_DEPOT_TO_DISTRICT_FREEFLOW_MIN: Final[float] = 45.0
FALLBACK_INTER_STOP_FREEFLOW_MIN: Final[float] = 15.0

TRIP_BUDGET_PREDAWN_MIN: Final[float] = 150.0
TRIP_BUDGET_DAYTIME_MIN: Final[float] = 330.0

MAX_RUN_SLOTS_PER_VEHICLE: Final[int] = 2
AMBER_UTILIZATION_THRESHOLD_PCT: Final[float] = 85.0
RED_UTILIZATION_THRESHOLD_PCT: Final[float] = 100.0

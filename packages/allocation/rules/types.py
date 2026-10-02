from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    passed: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)

@dataclass
class TripEvaluation:
    is_valid: bool
    violations: List[str]
    rule_results: List[RuleResult]
    total_weight_kg: float
    total_volume_m3: float
    total_duration_min: float
    weight_utilization_pct: float
    volume_utilization_pct: float
    time_utilization_pct: float
    rag_status: str

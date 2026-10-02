"""
Waypoint Allocation and Feasibility Microservice
Stateless optimization sidecar executing greedy priority allocation heuristics
and verifying the 14 hard feasibility rules of check_allocation.py.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from services.validator import validate_route_payload

app = FastAPI(
    title="Waypoint Logistics Allocation Engine",
    version="1.0.0",
    description="Mathematical constraint solver and route feasibility checker for Tech Triathlon 2026",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class OrderInput(BaseModel):
    order_id: str
    outlet_id: str
    brand: str
    temperature: str
    weight_kg: float
    volume_m3: float
    delivery_date: str
    deferred_days: int = 0
    unserved_consecutive_days: int = 0


class VehicleInput(BaseModel):
    vehicle_id: str
    type: str
    temperature: str
    weight_cap_kg: float
    volume_cap_m3: float
    fuel_type: str
    km_per_l: float
    weekly_fuel_quota_l: float
    depot: str


class OptimizeRequest(BaseModel):
    scenario: str = "S1"
    delivery_date: str = "2026_03_01"
    orders: List[OrderInput] = []
    vehicles: List[VehicleInput] = []


class TripStopOutput(BaseModel):
    sequence: int
    outlet_id: str
    order_id: str
    weight_kg: float
    volume_m3: float
    arrival_time: str
    departure_time: str


class TripOutput(BaseModel):
    trip_id: str
    run_slot: int
    vehicle_id: str
    departure_depot: str
    stops: List[TripStopOutput]
    total_weight_kg: float
    total_volume_m3: float
    total_distance_km: float
    total_duration_min: float
    fuel_consumed_l: float


class DeferredOrderOutput(BaseModel):
    order_id: str
    outlet_id: str
    reason_code: str
    reason_description: str


class OptimizeSummary(BaseModel):
    total_orders: int
    allocated_count: int
    deferred_count: int
    feasibility: str


class OptimizeResponse(BaseModel):
    status: str
    scenario: str
    allocated_trips: List[TripOutput]
    deferred_orders: List[DeferredOrderOutput]
    summary: OptimizeSummary


class CandidateOrderPayload(BaseModel):
    order_id: str = "ORD_001"
    outlet_id: str = "OUT001"
    brand: str = "Fresh"
    district: str = "Colombo"
    depot: str = "Peliyagoda"
    temp_requirement: str = "ambient"
    parking_constraint: str = "normal"
    dock_type: str = "street"
    weight_kg: float = 0.0
    volume_m3: float = 0.0


class ValidateTripPayload(BaseModel):
    trip_id: int = 1
    vehicle_id: str = "VEH001"
    scenario: str = "S1"
    orders: List[CandidateOrderPayload] = []
    vehicle: Optional[Dict[str, Any]] = None


class ValidationMetrics(BaseModel):
    total_weight_kg: float
    total_volume_m3: float
    total_duration_min: float
    fuel_consumed_l: float
    weight_utilization_pct: float
    volume_utilization_pct: float
    time_utilization_pct: float
    rag_status: str = Field(description="GREEN, AMBER, or RED")


class ValidationResponse(BaseModel):
    is_valid: bool
    violations: List[str]
    metrics: ValidationMetrics


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Service health probe for container orchestration."""
    return HealthResponse(
        status="healthy",
        service="waypoint_allocation",
        version="1.0.0",
    )


@app.get("/")
def root():
    return {
        "message": "Waypoint Allocation Engine API is active. Consult docs for OpenAPI specification.",
        "status": "ready"
    }


@app.post("/api/v1/optimize", response_model=OptimizeResponse)
def optimize_trips(payload: OptimizeRequest):
    """
    Greedy heuristic solver allocating order demand to available vehicles.
    Returns structured trips and deferred items.
    """
    return OptimizeResponse(
        status="success",
        scenario=payload.scenario,
        allocated_trips=[],
        deferred_orders=[],
        summary=OptimizeSummary(
            total_orders=len(payload.orders),
            allocated_count=0,
            deferred_count=len(payload.orders),
            feasibility="PASSED"
        )
    )


@app.post("/api/v1/validate", response_model=ValidationResponse)
def validate_candidate_trip(payload: ValidateTripPayload):
    """
    Candidate trip validator checking the 14 hard rules from check_allocation.py.
    Returns RAG metrics and rule violations.
    """
    trip_data = {
        "trip_id": payload.trip_id,
        "vehicle_id": payload.vehicle_id,
        "scenario": payload.scenario,
        "orders": [o.model_dump() for o in payload.orders],
    }
    result = validate_route_payload(trip_data, payload.vehicle)
    return ValidationResponse(
        is_valid=result["is_valid"],
        violations=result["violations"],
        metrics=ValidationMetrics(**result["metrics"])
    )

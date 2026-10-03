"""
Waypoint Allocation and Feasibility Microservice
Stateless optimization sidecar executing greedy priority allocation heuristics
and verifying the 14 hard feasibility rules of check_allocation.py.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from services.validator import validate_route_payload
from services.solver import run_greedy_allocation
from logger import log
from config import (
    DEFAULT_DEPOT,
    DEFAULT_VEHICLE_WEIGHT_CAP_KG,
    DEFAULT_VEHICLE_VOLUME_CAP_M3,
    DEFAULT_KM_PER_L,
    DEFAULT_WEEKLY_FUEL_QUOTA_L,
)

app = FastAPI(
    title="Waypoint Logistics Allocation Engine",
    version="1.0.0",
    description="Mathematical constraint solver and route feasibility checker for Tech Triathlon 2026",
)

ALLOWED_ORIGINS = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Enterprise global exception handler preventing unhandled stack trace leaks.
    """
    log.error(f"Unhandled error processing {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal logistics optimization engine error occurred",
            "detail": str(exc),
        },
    )


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class OrderInput(BaseModel):
    order_id: str
    outlet_id: str
    brand: str = "Fresh"
    district: str = "Colombo"
    depot: str = DEFAULT_DEPOT
    temperature: str = "ambient"
    weight_kg: float = 100.0
    volume_m3: float = 0.5
    delivery_date: str = "2026_03_01"
    parking_constraint: str = "normal"
    dock_type: str = "street"
    deferred_days: int = 0
    unserved_consecutive_days: int = 0


class VehicleInput(BaseModel):
    vehicle_id: str
    type: str = "truck"
    temperature: str = "ambient"
    weight_cap_kg: float = DEFAULT_VEHICLE_WEIGHT_CAP_KG
    volume_cap_m3: float = DEFAULT_VEHICLE_VOLUME_CAP_M3
    fuel_type: str = "diesel"
    km_per_l: float = DEFAULT_KM_PER_L
    weekly_fuel_quota_l: float = DEFAULT_WEEKLY_FUEL_QUOTA_L
    depot: str = DEFAULT_DEPOT


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
    mitigation_action: Optional[str] = None


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
    depot: str = DEFAULT_DEPOT
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
    """
    Service health probe for container orchestration and load balancers.
    """
    return HealthResponse(
        status="healthy",
        service="waypoint_allocation",
        version="1.0.0",
    )


@app.get("/")
def root():
    """
    Root status endpoint displaying API readiness.
    """
    return {
        "message": "Waypoint Allocation Engine API is active. Consult docs for OpenAPI specification.",
        "status": "ready"
    }


@app.post("/api/v1/optimize", response_model=OptimizeResponse)
def optimize_trips(payload: OptimizeRequest):
    """
    Greedy heuristic solver allocating order demand to available vehicles.
    Returns structured trips and diagnosed deferred items.
    """
    log.info(f"Received optimization request: scenario={payload.scenario}, orders={len(payload.orders)}")
    orders_data = [o.model_dump() for o in payload.orders]
    vehicles_data = [v.model_dump() for v in payload.vehicles]
    result = run_greedy_allocation(orders_data, vehicles_data, payload.scenario)
    return OptimizeResponse(**result)


@app.post("/api/v1/validate", response_model=ValidationResponse)
def validate_candidate_trip(payload: ValidateTripPayload):
    """
    Candidate trip validator checking the 14 hard rules from check_allocation.py.
    Returns RAG utilization metrics and itemized rule violations.
    """
    log.info(f"Validating trip candidate: vehicle={payload.vehicle_id}, orders={len(payload.orders)}")
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

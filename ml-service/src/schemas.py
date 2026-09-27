from pydantic import BaseModel
from typing import Optional, List

class AnalyzeRequest(BaseModel):
    policy_type: str          # 'automobile' | 'health'
    claim_amount: float
    coverage_amount: float
    injury_severity: str      # 'None' | 'Minor' | 'Major'
    description: str = ''
    # Automobile-specific (optional)
    incident_type: Optional[str] = None   # 'Collision'|'Theft'|'Fire'|'Vandalism'|'Flood'|'Hit & Run'
    # Health-specific (optional)
    treatment_type: Optional[str] = None  # 'Hospitalization'|'Surgery'|'Emergency'|'Outpatient'|'Pharmacy'

class PriorityFeature(BaseModel):
    feature: str
    impact: str

class AnalyzeResponse(BaseModel):
    priority_label: str    # 'priority' | 'non_priority'
    priority_score: float  # 0.0 - 1.0
    priority_reason: List[PriorityFeature]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str

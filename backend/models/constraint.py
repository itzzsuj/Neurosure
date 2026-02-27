from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class Constraint:
    """Base class for all constraints"""
    type: str  # 'waiting_period', 'age_limit', 'pre_existing', 'disease_coverage'
    clause_id: str
    clause_text: str
    page: int
    similarity_score: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type,
            'clause_id': self.clause_id,
            'clause_text': self.clause_text,
            'page': self.page,
            'similarity_score': self.similarity_score
        }

@dataclass
class WaitingPeriodConstraint(Constraint):
    """Waiting period constraint e.g., 'Diabetes covered after 2 years'"""
    condition: str  # 'diabetes', 'hypertension', etc.
    period_value: int  # 2
    period_unit: str  # 'days', 'months', 'years'
    period_days: int  # Converted to days
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            'condition': self.condition,
            'period_value': self.period_value,
            'period_unit': self.period_unit,
            'period_days': self.period_days
        })
        return data

@dataclass
class AgeLimitConstraint(Constraint):
    """Age limit constraint e.g., 'Covered up to age 65'"""
    limit_type: str  # 'min', 'max', 'range'
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            'limit_type': self.limit_type,
            'min_age': self.min_age,
            'max_age': self.max_age
        })
        return data

@dataclass
class PreExistingConstraint(Constraint):
    """Pre-existing condition constraint"""
    conditions: List[str]  # List of pre-existing conditions mentioned
    waiting_period_days: Optional[int] = None  # If there's a waiting period
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            'conditions': self.conditions,
            'waiting_period_days': self.waiting_period_days
        })
        return data

@dataclass
class DiseaseCoverageConstraint(Constraint):
    """Disease coverage constraint"""
    disease: str
    is_covered: bool
    restrictions: List[str]  # Any additional restrictions
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            'disease': self.disease,
            'is_covered': self.is_covered,
            'restrictions': self.restrictions
        })
        return data

@dataclass
class PatientProfile:
    """Patient profile from form"""
    age: int
    pre_existing_conditions: List[str]
    enrollment_date: str
    application_date: str
    policy_id: Optional[str] = None
    
    def get_days_since_enrollment(self) -> int:
        try:
            enroll = datetime.strptime(self.enrollment_date, '%Y-%m-%d').date()
            apply = datetime.strptime(self.application_date, '%Y-%m-%d').date()
            return max(0, (apply - enroll).days)
        except:
            return 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'age': self.age,
            'pre_existing_conditions': self.pre_existing_conditions,
            'enrollment_date': self.enrollment_date,
            'application_date': self.application_date,
            'days_since_enrollment': self.get_days_since_enrollment()
        }

@dataclass
class ConstraintAlignment:
    """Result of aligning patient with a constraint"""
    constraint: Constraint
    alignment_score: float  # 0-1 how well patient matches
    contradiction: bool
    contradiction_reason: Optional[str] = None
    risk_level: float = 0.0  # 0-1 risk contribution
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'constraint': self.constraint.to_dict(),
            'alignment_score': self.alignment_score,
            'contradiction': self.contradiction,
            'contradiction_reason': self.contradiction_reason,
            'risk_level': self.risk_level
        }
    
@dataclass
class PreExistingConstraint(Constraint):
    """Pre-existing condition constraint"""
    conditions: List[str]  # List of pre-existing conditions mentioned
    waiting_period_days: Optional[int] = None  # If there's a waiting period
    is_positive: bool = False  # True if clause is about waived/satisfied conditions
    
    def to_dict(self) -> Dict[str, Any]:
        data = super().to_dict()
        data.update({
            'conditions': self.conditions,
            'waiting_period_days': self.waiting_period_days,
            'is_positive': self.is_positive
        })
        return data
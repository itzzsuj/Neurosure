from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Optional, Dict, Any
from typing import Optional
from datetime import datetime

@dataclass
class Clause:
    id: str
    text: str
    category: str
    page: int
    similarity_score: float
    cds: Optional[float] = None  # Coverage Density Score
    erg: Optional[float] = None  # Exclusion Risk Gradient
    pai: Optional[float] = None  # Policy Ambiguity Index
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'category': self.category,
            'page_number': self.page,
            'similarity_score': self.similarity_score,
            'cds': self.cds,
            'erg': self.erg,
            'pai': self.pai
        }

@dataclass
class AnalysisJob:
    job_id: str
    filename: str
    file_path: str
    status: str  # pending, processing, completed, failed
    progress: int
    created_at: datetime
    error: Optional[str] = None
    clauses: Optional[List[Clause]] = None
    
    def to_dict(self):
        return {
            'job_id': self.job_id,
            'filename': self.filename,
            'status': self.status,
            'progress': self.progress,
            'created_at': self.created_at.isoformat(),
            'error': self.error
        }

@dataclass
class Disease:
    value: str
    label: str
    category: str
    
    def to_dict(self):
        return {
            'value': self.value,
            'label': self.label,
            'category': self.category
        }
    

# Add these classes to your existing file

@dataclass
class ClaimEvaluationRequest:
    age: int
    pre_existing_conditions: List[str]
    enrollment_date: str
    application_date: str
    disease: str
    policy_document_id: Optional[str] = None
    
    def to_dict(self):
        return {
            'age': self.age,
            'pre_existing_conditions': self.pre_existing_conditions,
            'enrollment_date': self.enrollment_date,
            'application_date': self.application_date,
            'disease': self.disease,
            'policy_document_id': self.policy_document_id
        }

@dataclass
class ClaimEvaluationResponse:
    success: bool
    decision: str  # 'ACCEPTED', 'REJECTED', 'REVIEW_REQUIRED', 'INCONCLUSIVE'
    confidence: float
    reason: str
    cds_score: float
    erg_score: float
    pai_score: float
    clauses: List[Dict]
    constraints: List[Dict]
    alignments: List[Dict]
    by_type: Dict
    message: Optional[str] = None
    
    def to_dict(self):
        return {
            'success': self.success,
            'decision': self.decision,
            'confidence': self.confidence,
            'reason': self.reason,
            'cds_score': self.cds_score,
            'erg_score': self.erg_score,
            'pai_score': self.pai_score,
            'clauses': self.clauses,
            'constraints': self.constraints,
            'alignments': self.alignments,
            'by_type': self.by_type,
            'message': self.message
        }
    

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
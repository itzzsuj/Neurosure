from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Optional, Dict, Any

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
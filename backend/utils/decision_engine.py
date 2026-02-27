from typing import List, Dict, Any, Optional
import logging
from models.constraint import PatientProfile, Constraint
from utils.constraint_extractor import ConstraintExtractor
from utils.patient_aligner import PatientAligner
from utils.clause_analyzer import ClauseAnalyzer

logger = logging.getLogger(__name__)

class DecisionEngine:
    """
    Main decision engine that orchestrates the entire process
    """
    
    def __init__(self, clause_analyzer: ClauseAnalyzer):
        self.clause_analyzer = clause_analyzer
        self.constraint_extractor = ConstraintExtractor()
        self.patient_aligner = PatientAligner()
    
    def evaluate_claim(self, patient: PatientProfile, 
                       clauses: List[Dict[str, Any]],
                       disease_name: str) -> Dict[str, Any]:
        """
        Evaluate a claim based on patient profile and retrieved clauses
        """
        # First, analyze clauses with existing analyzer
        analyzed_clauses = []
        for clause in clauses:
            analysis = self.clause_analyzer.analyze_disease_specific_clause(
                clause['text'], disease_name
            )
            analyzed_clause = {
                **clause,
                'cds': analysis.get('cds', 50),
                'erg': analysis.get('erg', 50),
                'pai': analysis.get('pai', 2.5),
                'category': analysis.get('category', 'General'),
                'disease_mentioned': analysis.get('disease_mentioned', False)
            }
            analyzed_clauses.append(analyzed_clause)
        
        # Extract constraints from clauses
        constraints = self.constraint_extractor.extract_constraints(
            analyzed_clauses, disease_name
        )
        
        logger.info(f"Extracted {len(constraints)} constraints")
        
        # Align patient with constraints
        alignment_result = self.patient_aligner.align_patient_with_constraints(
            patient, constraints
        )
        
        logger.info(f"Alignment result: {alignment_result}")
        
        # Combine results
        result = {
            'success': True,
            'patient': patient.to_dict(),
            'clauses': analyzed_clauses,
            'constraints': [c.to_dict() for c in constraints],
            'alignment': alignment_result,
            'cds_score': alignment_result['overall']['cds'],
            'erg_score': alignment_result['overall']['erg'],
            'pai_score': alignment_result['overall']['pai'],
            'summary': {
                'total_clauses': len(analyzed_clauses),
                'total_constraints': len(constraints),
                'decision': alignment_result['decision']['decision'],
                'reason': alignment_result['decision']['reason'],
                'confidence': alignment_result['decision']['confidence']
            }
        }
        
        return result
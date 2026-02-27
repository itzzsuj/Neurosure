import numpy as np
from typing import List, Dict, Any, Tuple
import logging
from models.constraint import (
    Constraint, WaitingPeriodConstraint, AgeLimitConstraint,
    PreExistingConstraint, DiseaseCoverageConstraint, PatientProfile,
    ConstraintAlignment
)

logger = logging.getLogger(__name__)

class PatientAligner:
    """
    Aligns patient profile with extracted constraints using attention
    Computes alignment scores and detects contradictions
    """
    
    def __init__(self):
        # Weights for different constraint types
        self.constraint_weights = {
            'waiting_period': 0.35,
            'age_limit': 0.25,
            'pre_existing': 0.25,
            'disease_coverage': 0.15
        }
    
    def align_patient_with_constraints(self, patient: PatientProfile,
                                       constraints: List[Constraint]) -> Dict[str, Any]:
        """
        Align patient with all constraints and compute overall metrics
        """
        alignments = []
        
        for constraint in constraints:
            alignment = self._align_single_constraint(patient, constraint)
            if alignment:  # Only add if not None
                alignments.append(alignment)
        
        # Group by constraint type
        by_type = self._group_by_type(alignments)
        
        # Calculate overall scores
        overall_scores = self._calculate_overall_scores(alignments, by_type)
        
        # Make final decision
        decision = self._make_decision(alignments, overall_scores)
        
        return {
            'alignments': [a.to_dict() for a in alignments],
            'by_type': by_type,
            'overall': overall_scores,
            'decision': decision,
            'contradiction_count': sum(1 for a in alignments if a.contradiction),
            'total_constraints': len(alignments)
        }
    
    def _align_single_constraint(self, patient: PatientProfile,
                                 constraint: Constraint) -> ConstraintAlignment:
        """Align patient with a single constraint"""
        
        if isinstance(constraint, WaitingPeriodConstraint):
            return self._align_waiting_constraint(patient, constraint)
        elif isinstance(constraint, AgeLimitConstraint):
            return self._align_age_constraint(patient, constraint)
        elif isinstance(constraint, PreExistingConstraint):
            return self._align_pre_existing_constraint(patient, constraint)
        elif isinstance(constraint, DiseaseCoverageConstraint):
            # 🟢 COMPLETELY SKIP disease coverage constraints
            return None
        
        return None
    
    def _align_waiting_constraint(self, patient: PatientProfile,
                                  constraint: WaitingPeriodConstraint) -> ConstraintAlignment:
        """Align waiting period constraint"""
        days_since = patient.get_days_since_enrollment()
        required_days = constraint.period_days
        
        # Calculate alignment score (how well patient meets requirement)
        if days_since >= required_days:
            alignment_score = 1.0
            contradiction = False
            reason = None
            risk = 0.0
        else:
            alignment_score = days_since / required_days if required_days > 0 else 0
            contradiction = True
            reason = f"Waiting period not met: {days_since}/{required_days} days"
            risk = 1.0 - alignment_score
        
        return ConstraintAlignment(
            constraint=constraint,
            alignment_score=alignment_score,
            contradiction=contradiction,
            contradiction_reason=reason,
            risk_level=risk
        )
    
    def _align_age_constraint(self, patient: PatientProfile,
                              constraint: AgeLimitConstraint) -> ConstraintAlignment:
        """Align age constraint"""
        age = patient.age
        
        if constraint.limit_type == 'min':
            if age >= constraint.min_age:
                alignment_score = 1.0
                contradiction = False
                reason = None
                risk = 0.0
            else:
                alignment_score = age / constraint.min_age if constraint.min_age > 0 else 0
                contradiction = True
                reason = f"Age {age} below minimum {constraint.min_age}"
                risk = 1.0 - alignment_score
                
        elif constraint.limit_type == 'max':
            if age <= constraint.max_age:
                alignment_score = 1.0
                contradiction = False
                reason = None
                risk = 0.0
            else:
                alignment_score = constraint.max_age / age if age > 0 else 0
                contradiction = True
                reason = f"Age {age} exceeds maximum {constraint.max_age}"
                risk = 1.0 - alignment_score
                
        elif constraint.limit_type == 'range':
            if constraint.min_age <= age <= constraint.max_age:
                alignment_score = 1.0
                contradiction = False
                reason = None
                risk = 0.0
            elif age < constraint.min_age:
                alignment_score = age / constraint.min_age if constraint.min_age > 0 else 0
                contradiction = True
                reason = f"Age {age} below range {constraint.min_age}-{constraint.max_age}"
                risk = 1.0 - alignment_score
            else:
                alignment_score = constraint.max_age / age if age > 0 else 0
                contradiction = True
                reason = f"Age {age} above range {constraint.min_age}-{constraint.max_age}"
                risk = 1.0 - alignment_score
        
        return ConstraintAlignment(
            constraint=constraint,
            alignment_score=alignment_score,
            contradiction=contradiction,
            contradiction_reason=reason,
            risk_level=risk
        )
    
    def _align_pre_existing_constraint(self, patient: PatientProfile,
                                   constraint: PreExistingConstraint) -> ConstraintAlignment:
        """Align pre-existing condition constraint"""
        patient_conditions = [c.lower() for c in patient.pre_existing_conditions]
        
        # Check if any patient condition matches constraint conditions
        matches = []
        for cond in constraint.conditions:
            cond_lower = cond.lower()
            if cond_lower == 'any' or any(cond_lower in pc or pc in cond_lower for pc in patient_conditions):
                matches.append(cond)
        
        # If this is a positive clause (about waived/satisfied conditions)
        if hasattr(constraint, 'is_positive') and constraint.is_positive:
            if matches:
                # Patient has matching conditions - this clause is RELEVANT
                if constraint.waiting_period_days:
                    days_since = patient.get_days_since_enrollment()
                    if days_since >= constraint.waiting_period_days:
                        # Waiting period satisfied - GOOD
                        return ConstraintAlignment(
                            constraint=constraint,
                            alignment_score=1.0,
                            contradiction=False,
                            contradiction_reason=f"Pre-existing waiting period satisfied ({days_since}/{constraint.waiting_period_days} days)",
                            risk_level=0.0
                        )
                    else:
                        # Waiting period not satisfied - but this is still informative
                        return ConstraintAlignment(
                            constraint=constraint,
                            alignment_score=days_since / constraint.waiting_period_days,
                            contradiction=False,  # Not a contradiction, just informative
                            contradiction_reason=None,
                            risk_level=0.0
                        )
                else:
                    # No waiting period mentioned - positive clause
                    return ConstraintAlignment(
                        constraint=constraint,
                        alignment_score=1.0,
                        contradiction=False,
                        risk_level=0.0
                    )
            else:
                # Patient doesn't have matching conditions - clause not relevant
                return ConstraintAlignment(
                    constraint=constraint,
                    alignment_score=1.0,
                    contradiction=False,
                    risk_level=0.0
                )
        
        # Original logic for negative/exclusion clauses
        if not matches:
            # No matching pre-existing conditions - this is GOOD
            return ConstraintAlignment(
                constraint=constraint,
                alignment_score=1.0,
                contradiction=False,
                risk_level=0.0
            )
        
        # Patient has matching pre-existing condition
        if constraint.waiting_period_days:
            days_since = patient.get_days_since_enrollment()
            if days_since >= constraint.waiting_period_days:
                # Waiting period satisfied - this is GOOD
                alignment_score = 1.0
                contradiction = False
                reason = f"Pre-existing waiting period satisfied ({days_since}/{constraint.waiting_period_days} days)"
                risk = 0.0
            else:
                # Waiting period not satisfied - CONTRADICTION
                alignment_score = days_since / constraint.waiting_period_days if constraint.waiting_period_days > 0 else 0
                contradiction = True
                reason = f"Pre-existing condition waiting period not met: {days_since}/{constraint.waiting_period_days} days"
                risk = 1.0 - alignment_score
        else:
            # No waiting period specified - immediate exclusion (CONTRADICTION)
            alignment_score = 0.0
            contradiction = True
            reason = f"Pre-existing condition '{matches[0]}' excluded"
            risk = 1.0
        
        return ConstraintAlignment(
            constraint=constraint,
            alignment_score=alignment_score,
            contradiction=contradiction,
            contradiction_reason=reason,
            risk_level=risk
        )
    
    def _group_by_type(self, alignments: List[ConstraintAlignment]) -> Dict[str, Any]:
        """Group alignments by constraint type"""
        by_type = {}
        
        for alignment in alignments:
            ctype = alignment.constraint.type
            if ctype not in by_type:
                by_type[ctype] = {
                    'total': 0,
                    'contradictions': 0,
                    'avg_risk': 0.0,
                    'alignments': []
                }
            
            by_type[ctype]['total'] += 1
            if alignment.contradiction:
                by_type[ctype]['contradictions'] += 1
            by_type[ctype]['avg_risk'] += alignment.risk_level
            by_type[ctype]['alignments'].append(alignment.to_dict())
        
        # Calculate averages
        for ctype in by_type:
            if by_type[ctype]['total'] > 0:
                by_type[ctype]['avg_risk'] /= by_type[ctype]['total']
        
        return by_type
    
    def _calculate_overall_scores(self, alignments: List[ConstraintAlignment],
                                   by_type: Dict[str, Any]) -> Dict[str, float]:
        """Calculate overall CDS/ERG/PAI from alignments"""
        
        # CDS: Coverage support (inverse of contradictions)
        total_constraints = len(alignments)
        contradictions = sum(1 for a in alignments if a.contradiction)
        cds = 1.0 - (contradictions / total_constraints) if total_constraints > 0 else 0.0
        
        # ERG: Average risk level
        erg = sum(a.risk_level for a in alignments) / total_constraints if total_constraints > 0 else 0.0
        
        # PAI: Uncertainty based on constraint types mix
        num_types = len(by_type)
        type_diversity = num_types / 4.0  # 4 possible types
        pai = 0.3 + (0.7 * type_diversity)  # Base 0.3, increases with diversity
        
        return {
            'cds': cds,
            'erg': erg,
            'pai': pai,
            'contradiction_rate': contradictions / total_constraints if total_constraints > 0 else 0.0
        }
    
    def _make_decision(self, alignments: List[ConstraintAlignment],
                       overall_scores: Dict[str, float]) -> Dict[str, Any]:
        """Make final accept/reject decision - BINARY: ACCEPTED or REJECTED"""
        
        if not alignments:
            return {
                'decision': 'REJECTED',
                'reason': 'No constraints found for analysis',
                'confidence': 0.0,
                'critical_contradictions': 0
            }
        
        # Check for ANY contradiction
        contradictions = [a for a in alignments if a.contradiction]
        
        if contradictions:
            # Get the most critical contradiction for the reason
            worst = max(contradictions, key=lambda x: x.risk_level)
            return {
                'decision': 'REJECTED',
                'reason': worst.contradiction_reason or 'Policy contradiction detected',
                'confidence': 1.0 - worst.risk_level,
                'critical_contradictions': len(contradictions)
            }
        else:
            # No contradictions - ACCEPTED
            return {
                'decision': 'ACCEPTED',
                'reason': 'All policy constraints satisfied',
                'confidence': overall_scores.get('cds', 0.8),
                'critical_contradictions': 0
            }
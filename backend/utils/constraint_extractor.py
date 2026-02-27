import re
from typing import List, Dict, Any, Optional
import logging
from models.constraint import (
    Constraint, WaitingPeriodConstraint, AgeLimitConstraint,
    PreExistingConstraint, DiseaseCoverageConstraint
)

logger = logging.getLogger(__name__)

class ConstraintExtractor:
    """
    Extracts structured constraints from policy clauses
    Converts natural language to machine-readable constraints
    """
    
    def __init__(self):
        # Waiting period patterns
        self.waiting_patterns = [
            (r'(\d+)\s*days?\s*(?:of|after|from)\s*cover', 'days', 'waiting'),
            (r'(\d+)\s*(?:month|months?)\s*(?:of|after|from)\s*cover', 'months', 'waiting'),
            (r'(\d+)\s*(?:year|years?)\s*(?:of|after|from)\s*cover', 'years', 'waiting'),
            (r'first\s*(\d+)\s*days?', 'days', 'waiting'),
            (r'first\s*(\d+)\s*(?:month|months?)', 'months', 'waiting'),
            (r'first\s*(\d+)\s*(?:year|years?)', 'years', 'waiting'),
            (r'waiting period of\s*(\d+)\s*days?', 'days', 'waiting'),
            (r'waiting period of\s*(\d+)\s*(?:month|months?)', 'months', 'waiting'),
            (r'waiting period of\s*(\d+)\s*(?:year|years?)', 'years', 'waiting'),
        ]
        
        # Age limit patterns
        self.age_patterns = [
            (r'age\s*(?:above|over|>|greater than)\s*(\d+)', 'min', 'age'),
            (r'age\s*(?:below|under|<|less than)\s*(\d+)', 'max', 'age'),
            (r'age\s*(\d+)\s*(?:to|\-)\s*(\d+)', 'range', 'age'),
            (r'aged?\s*(\d+)\s*(?:years?)?\s*(?:and|to)\s*(\d+)', 'range', 'age'),
            (r'up to age\s*(\d+)', 'max', 'age'),
            (r'minimum age\s*(\d+)', 'min', 'age'),
            (r'maximum age\s*(\d+)', 'max', 'age'),
        ]
        
        # Pre-existing condition patterns
        self.pre_existing_patterns = [
            (r'pre[\-\s]existing', 'keyword'),
            (r'existing condition', 'keyword'),
            (r'prior condition', 'keyword'),
            (r'known condition', 'keyword'),
            (r'any condition.*?(?:diagnosed|treated).*?prior', 'keyword'),
        ]
        
        # Disease names
        self.disease_keywords = [
            'diabetes', 'hypertension', 'asthma', 'copd', 'cancer',
            'arthritis', 'thyroid', 'cataract', 'hernia', 'piles',
            'fistula', 'gallstones', 'kidney stones', 'sinusitis'
        ]
    
    def extract_constraints(self, clauses: List[Dict[str, Any]], 
                           disease_name: Optional[str] = None) -> List[Constraint]:
        """
        Extract all constraints from a list of clauses
        """
        constraints = []
        
        for clause in clauses:
            text = clause.get('text', '')
            clause_id = clause.get('id', '')
            page = clause.get('page', 1)
            score = clause.get('similarity_score', 0.5)
            
            # Extract different types of constraints
            waiting_constraints = self._extract_waiting_constraints(
                text, clause_id, page, score, disease_name
            )
            constraints.extend(waiting_constraints)
            
            age_constraints = self._extract_age_constraints(
                text, clause_id, page, score
            )
            constraints.extend(age_constraints)
            
            pre_existing_constraints = self._extract_pre_existing_constraints(
                text, clause_id, page, score, disease_name  # Pass disease_name
            )
            constraints.extend(pre_existing_constraints)
            
            disease_constraints = self._extract_disease_constraints(
                text, clause_id, page, score, disease_name
            )
            constraints.extend(disease_constraints)
        
        logger.info(f"Extracted {len(constraints)} constraints from {len(clauses)} clauses")
        return constraints
    
    def _extract_waiting_constraints(self, text: str, clause_id: str, 
                                      page: int, score: float,
                                      disease_name: Optional[str]) -> List[WaitingPeriodConstraint]:
        """Extract waiting period constraints"""
        constraints = []
        text_lower = text.lower()
        
        for pattern, unit, _ in self.waiting_patterns:
            match = re.search(pattern, text_lower)
            if match:
                value = int(match.group(1))
                
                # Convert to days
                if unit == 'months':
                    days = value * 30
                elif unit == 'years':
                    days = value * 365
                else:
                    days = value
                
                # Determine the condition
                condition = 'general'
                for disease in self.disease_keywords:
                    if disease in text_lower:
                        condition = disease
                        break
                
                # If disease_name provided and in text, use that
                if disease_name and disease_name.lower() in text_lower:
                    condition = disease_name.lower()
                
                constraint = WaitingPeriodConstraint(
                    type='waiting_period',
                    clause_id=clause_id,
                    clause_text=text,
                    page=page,
                    similarity_score=score,
                    condition=condition,
                    period_value=value,
                    period_unit=unit,
                    period_days=days
                )
                constraints.append(constraint)
                break  # Only extract first waiting period per clause
        
        return constraints
    
    def _extract_age_constraints(self, text: str, clause_id: str,
                                  page: int, score: float) -> List[AgeLimitConstraint]:
        """Extract age limit constraints"""
        constraints = []
        text_lower = text.lower()
        
        for pattern, limit_type, _ in self.age_patterns:
            match = re.search(pattern, text_lower)
            if match:
                if limit_type == 'min':
                    min_age = int(match.group(1))
                    constraint = AgeLimitConstraint(
                        type='age_limit',
                        clause_id=clause_id,
                        clause_text=text,
                        page=page,
                        similarity_score=score,
                        limit_type='min',
                        min_age=min_age
                    )
                    constraints.append(constraint)
                    
                elif limit_type == 'max':
                    max_age = int(match.group(1))
                    constraint = AgeLimitConstraint(
                        type='age_limit',
                        clause_id=clause_id,
                        clause_text=text,
                        page=page,
                        similarity_score=score,
                        limit_type='max',
                        max_age=max_age
                    )
                    constraints.append(constraint)
                    
                elif limit_type == 'range':
                    min_age = int(match.group(1))
                    max_age = int(match.group(2))
                    constraint = AgeLimitConstraint(
                        type='age_limit',
                        clause_id=clause_id,
                        clause_text=text,
                        page=page,
                        similarity_score=score,
                        limit_type='range',
                        min_age=min_age,
                        max_age=max_age
                    )
                    constraints.append(constraint)
                
                break  # Only extract first age constraint per clause
        
        return constraints
    
    def _extract_pre_existing_constraints(self, text: str, clause_id: str,
                                       page: int, score: float,
                                       disease_name: Optional[str]) -> List[PreExistingConstraint]:
        """Extract pre-existing condition constraints"""
        constraints = []
        text_lower = text.lower()
        
        # Check if this is a pre-existing clause - but be more specific
        is_pre_existing = False
        
        # Look for explicit pre-existing EXCLUSION language
        exclusion_indicators = [
            (r'pre[\-\s]existing.*exclu', 'exclusion'),
            (r'existing condition.*not covered', 'exclusion'),
            (r'pre[\-\s]existing.*not covered', 'exclusion'),
            (r'pre[\-\s]existing.*shall not', 'exclusion'),
            (r'pre[\-\s]existing.*will not', 'exclusion'),
            (r'pre[\-\s]existing.*benefits.*not.*available', 'exclusion'),
            (r'pre[\-\s]existing.*no.*benefits', 'exclusion'),
        ]
        
        for pattern, _ in exclusion_indicators:
            if re.search(pattern, text_lower):
                is_pre_existing = True
                break
        
        # Also check for the general pre-existing patterns but with context
        if not is_pre_existing:
            for pattern, _ in self.pre_existing_patterns:
                if re.search(pattern, text_lower):
                    # Check if this is about coverage/benefits rather than exclusion
                    if any(word in text_lower for word in ['continuity', 'waived', 'satisfied', 'after', 'complete']):
                        # This is about waiting period satisfaction, NOT an exclusion
                        continue
                    is_pre_existing = True
                    break
        
        if is_pre_existing:
            # Find which conditions are mentioned
            conditions = []
            for disease in self.disease_keywords:
                if disease in text_lower:
                    conditions.append(disease)
            
            # Look for waiting period
            waiting_days = None
            for pattern, unit, _ in self.waiting_patterns:
                match = re.search(pattern, text_lower)
                if match:
                    value = int(match.group(1))
                    if unit == 'months':
                        waiting_days = value * 30
                    elif unit == 'years':
                        waiting_days = value * 365
                    else:
                        waiting_days = value
                    break
            
            # If no explicit waiting period found, check for 48 months (4 years)
            if waiting_days is None and ('48' in text_lower or 'four' in text_lower) and ('month' in text_lower or 'year' in text_lower):
                waiting_days = 48 * 30  # 1440 days
            
            # If this is about continuity/waived, it's actually a positive clause, not a contradiction
            is_positive = any(word in text_lower for word in ['waived', 'continuity', 'satisfied', 'without loss'])
            
            constraint = PreExistingConstraint(
                type='pre_existing',
                clause_id=clause_id,
                clause_text=text,
                page=page,
                similarity_score=score,
                conditions=conditions if conditions else ['any'],
                waiting_period_days=waiting_days,
                is_positive=is_positive  # We need to add this field
            )
            constraints.append(constraint)
        
        return constraints
    
    def _extract_disease_constraints(self, text: str, clause_id: str,
                                      page: int, score: float,
                                      disease_name: Optional[str]) -> List[DiseaseCoverageConstraint]:
        """Extract disease coverage constraints"""
        constraints = []
        
        if not disease_name:
            return constraints
        
        text_lower = text.lower()
        disease_lower = disease_name.lower()
        
        # Check if disease is mentioned
        if disease_lower in text_lower:
            # Determine if covered or excluded
            is_covered = True
            restrictions = []
            
            exclusion_words = ['exclu', 'not covered', 'not eligible', 'shall not']
            for word in exclusion_words:
                if word in text_lower:
                    is_covered = False
                    restrictions.append(f"Exclusion: {word}")
            
            # Look for additional restrictions
            if 'only if' in text_lower or 'provided that' in text_lower:
                restrictions.append('Conditional coverage')
            
            constraint = DiseaseCoverageConstraint(
                type='disease_coverage',
                clause_id=clause_id,
                clause_text=text,
                page=page,
                similarity_score=score,
                disease=disease_name,
                is_covered=is_covered,
                restrictions=restrictions
            )
            constraints.append(constraint)
        
        return constraints
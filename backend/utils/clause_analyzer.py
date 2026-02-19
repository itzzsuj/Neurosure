import re
from typing import Dict, Any, List
import numpy as np

class ClauseAnalyzer:
    def __init__(self):
        # Keywords for different clause categories
        self.coverage_keywords = [
            'coverage', 'cover', 'covered', 'benefits', 'benefit',
            'reimbursement', 'reimburse', 'payment', 'pay', 'eligible',
            'entitled', 'entitlement', 'shall pay', 'will cover',
            'includes', 'including', 'provided', 'payable'
        ]
        
        self.exclusion_keywords = [
            'exclusion', 'exclude', 'excluded', 'not covered',
            'does not cover', 'will not pay', 'shall not',
            'not eligible', 'ineligible', 'limitation', 'limit',
            'except', 'exception', 'exceptions', 'excluding',
            'not included', 'shall not cover'
        ]
        
        self.ambiguity_keywords = [
            'may', 'might', 'could', 'possibly', 'usually',
            'generally', 'normally', 'typical', 'reasonable',
            'appropriate', 'as determined by', 'at our discretion',
            'sole discretion', 'subject to', 'depending on',
            'in some cases', 'if necessary', 'as applicable'
        ]
        
        self.waiting_keywords = [
            'waiting period', 'first 30 days', 'first year',
            'first two years', 'first three years', 'commencement',
            'inception', 'initial period', 'after', 'within',
            'days of cover', 'months of cover', 'years of cover'
        ]
        
        self.pre_existing_keywords = [
            'pre-existing', 'preexisting', 'existing condition',
            'prior condition', 'pre existing', 'already had',
            'before inception', 'prior to', 'known condition'
        ]
    
    def analyze_clause(self, text: str, disease: str) -> Dict[str, Any]:
        """Analyze a clause and return category and metrics"""
        
        # Determine category
        category = self._determine_category(text)
        
        # Calculate metrics
        cds = self._calculate_coverage_density(text, disease)
        erg = self._calculate_exclusion_risk(text, disease)
        pai = self._calculate_ambiguity_index(text)
        
        return {
            'category': category,
            'cds': cds,
            'erg': erg,
            'pai': pai
        }
    
    def analyze_disease_specific_clause(self, text: str, disease_name: str) -> Dict[str, Any]:
        """Analyze clause with disease-specific context"""
        
        text_lower = text.lower()
        disease_lower = disease_name.lower()
        disease_parts = disease_lower.split()
        
        # Check if disease is explicitly mentioned
        disease_mentioned = disease_lower in text_lower or any(part in text_lower for part in disease_parts if len(part) > 3)
        
        # Determine category with disease context
        category = self._determine_category(text)
        
        # Check for waiting period mentions
        has_waiting_period = any(keyword in text_lower for keyword in self.waiting_keywords)
        
        # Check for pre-existing condition mentions
        has_pre_existing = any(keyword in text_lower for keyword in self.pre_existing_keywords)
        
        # Calculate disease-specific metrics
        if disease_mentioned:
            # Boost scores if disease is mentioned
            cds = self._calculate_coverage_density(text, disease_name) + 10
            erg = self._calculate_exclusion_risk(text, disease_name) + 5
        else:
            cds = self._calculate_coverage_density(text, disease_name)
            erg = self._calculate_exclusion_risk(text, disease_name)
        
        # Adjust category based on context
        if has_waiting_period and category == "General":
            category = "Waiting Period"
        elif has_pre_existing and category == "General":
            category = "Pre-existing Condition"
        
        pai = self._calculate_ambiguity_index(text)
        
        return {
            'category': category,
            'cds': min(cds, 100),
            'erg': min(erg, 100),
            'pai': pai,
            'disease_mentioned': disease_mentioned,
            'has_waiting_period': has_waiting_period,
            'has_pre_existing': has_pre_existing
        }
    
    def _determine_category(self, text: str) -> str:
        """Determine the category of a clause"""
        text_lower = text.lower()
        
        # Check for exclusion keywords first (often more specific)
        if any(keyword in text_lower for keyword in self.exclusion_keywords):
            return "Exclusion"
        
        # Check for coverage keywords
        if any(keyword in text_lower for keyword in self.coverage_keywords):
            return "Coverage"
        
        # Check for waiting period keywords
        if any(keyword in text_lower for keyword in self.waiting_keywords):
            return "Waiting Period"
        
        # Check for pre-existing keywords
        if any(keyword in text_lower for keyword in self.pre_existing_keywords):
            return "Pre-existing Condition"
        
        # Check for ambiguity
        ambiguity_score = self._calculate_ambiguity_index(text)
        if ambiguity_score > 3.5:
            return "Ambiguity"
        
        return "General"
    
    def _calculate_coverage_density(self, text: str, disease: str) -> float:
        """Calculate Coverage Density Score (0-100)"""
        text_lower = text.lower()
        disease_parts = disease.replace('_', ' ').lower().split()
        
        # Base score
        score = 50
        
        # Check for disease mention
        disease_mentioned = any(part in text_lower for part in disease_parts if len(part) > 3)
        if disease_mentioned:
            score += 20
        
        # Check for coverage keywords
        coverage_count = sum(1 for kw in self.coverage_keywords if kw in text_lower)
        score += min(coverage_count * 5, 20)
        
        # Check for specific coverage indicators
        if 'pre-existing' in text_lower:
            score -= 15
        if 'chronic' in text_lower and any(part in text_lower for part in ['condition', 'illness']):
            score += 10
        if 'lifetime' in text_lower or 'maximum' in text_lower:
            score -= 5
        
        # Check for positive coverage language
        positive_indicators = ['shall be covered', 'will be paid', 'eligible for', 'entitled to']
        if any(ind in text_lower for ind in positive_indicators):
            score += 10
        
        return min(max(int(score), 0), 100)
    
    def _calculate_exclusion_risk(self, text: str, disease: str) -> float:
        """Calculate Exclusion Risk Gradient (0-100)"""
        text_lower = text.lower()
        disease_parts = disease.replace('_', ' ').lower().split()
        
        # Base score
        score = 30
        
        # Check for exclusion keywords
        exclusion_count = sum(1 for kw in self.exclusion_keywords if kw in text_lower)
        score += min(exclusion_count * 8, 40)
        
        # Check if disease is specifically excluded
        disease_excluded = False
        for part in disease_parts:
            if len(part) > 3:
                if f"exclude.*{part}" in text_lower or f"{part}.*excluded" in text_lower:
                    disease_excluded = True
                    break
        
        if disease_excluded:
            score += 30
        
        # Check for limitation language
        if 'limit' in text_lower or 'maximum' in text_lower or 'cap' in text_lower:
            score += 15
        if 'not covered' in text_lower or 'excluded' in text_lower:
            score += 20
        
        return min(max(int(score), 0), 100)
    
    def _calculate_ambiguity_index(self, text: str) -> float:
        """Calculate Policy Ambiguity Index (1-10)"""
        text_lower = text.lower()
        
        # Count ambiguous terms
        ambiguity_count = sum(1 for kw in self.ambiguity_keywords if kw in text_lower)
        
        # Base score
        score = 2.0
        
        # Add for ambiguous terms
        score += ambiguity_count * 0.5
        
        # Check for vague language patterns
        if 'and/or' in text_lower:
            score += 0.5
        if 'etc' in text_lower:
            score += 0.3
        if 'such as' in text_lower and 'including but not limited to' in text_lower:
            score += 0.7
        if 'at our discretion' in text_lower:
            score += 1.0
        
        # Sentence complexity check
        sentences = text.split('.')
        if sentences:
            avg_sentence_length = sum(len(s.split()) for s in sentences if s.strip()) / len([s for s in sentences if s.strip()])
            if avg_sentence_length > 30:
                score += 1.0
            elif avg_sentence_length > 20:
                score += 0.5
        
        return min(round(score, 1), 10.0)
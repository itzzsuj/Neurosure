# layers/pai_calculator.py
import math
import numpy as np

class PAICalculator:
    """
    Calculates Policy Ambiguity Index from constraint types and contradictions
    Higher PAI = more ambiguity/conflict in policy interpretation
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, clause_embeddings=None, return_report=False):
        """
        This method is called from app.py - it should receive alignments
        """
        # Check if we're getting alignments
        if retrieved_clauses and isinstance(retrieved_clauses[0], dict) and 'alignment_score' in retrieved_clauses[0]:
            return self.calculate_from_alignments(retrieved_clauses, disease_name, return_report)
        else:
            msg = f"\n📊 Calculating PAI for {disease_name} - No alignments found"
            print(msg)
            if return_report:
                return 0.0, msg
            return 0.0
    
    def calculate_from_alignments(self, alignments, disease_name, return_report=False):
        """
        Calculate PAI from constraint alignments
        
        Args:
            alignments: List of ConstraintAlignment objects from patient_aligner
            disease_name: Name of the disease being checked
            return_report: If True, returns (score, report_text) tuple
        """
        
        report_lines = []
        
        if not alignments:
            msg = f"\n📊 Calculating PAI for {disease_name} - No alignments found"
            print(msg)
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating PAI for {disease_name} from {len(alignments)} constraints"
        separator = "=" * 80
        print(header)
        print(separator)
        report_lines.append(header)
        report_lines.append(separator)

        # Count constraints by type
        type_counts = {
            'waiting_period': 0,
            'age_limit': 0,
            'pre_existing': 0,
            'disease_coverage': 0
        }
        
        contradictions_by_type = {
            'waiting_period': 0,
            'age_limit': 0,
            'pre_existing': 0,
            'disease_coverage': 0
        }
        
        for alignment in alignments:
            # Handle both dict and object
            if hasattr(alignment, 'to_dict'):
                alignment = alignment.to_dict()
                
            constraint = alignment.get('constraint', {})
            ctype = constraint.get('type', 'unknown')
            contradiction = alignment.get('contradiction', False)
            
            if ctype in type_counts:
                type_counts[ctype] += 1
                if contradiction:
                    contradictions_by_type[ctype] += 1
        
        # Calculate entropy (diversity of constraint types)
        total = len(alignments)
        if total > 0:
            proportions = []
            for ctype, count in type_counts.items():
                if count > 0:
                    proportions.append(count / total)
            
            if proportions:
                entropy = -sum(p * math.log(p) for p in proportions) / math.log(4) if len(proportions) > 1 else 0
            else:
                entropy = 0
        else:
            entropy = 0
        
        # Calculate conflict score (ratio of contradictions)
        if total > 0:
            total_contradictions = sum(contradictions_by_type.values())
            conflict = total_contradictions / total
        else:
            conflict = 0
        
        # Calculate type variance
        counts_list = list(type_counts.values())
        mean = sum(counts_list) / 4 if sum(counts_list) > 0 else 0
        variance = sum((x - mean) ** 2 for x in counts_list) / 4 if mean > 0 else 0
        rel_variance = variance / (mean ** 2 + 0.01) if mean > 0 else 0
        
        # Calculate contradiction diversity
        if total_contradictions > 0:
            contradiction_props = []
            for ctype, count in contradictions_by_type.items():
                if count > 0:
                    contradiction_props.append(count / total_contradictions)
            contradiction_entropy = -sum(p * math.log(p) for p in contradiction_props) / math.log(4) if contradiction_props else 0
        else:
            contradiction_entropy = 0
        
        # Weights for different factors
        w_entropy = 0.2
        w_variance = 0.15
        w_conflict = 0.4
        w_contradiction_diversity = 0.25
        
        # Raw PAI
        raw_pai = (w_entropy * entropy + 
                   w_variance * rel_variance + 
                   w_conflict * conflict + 
                   w_contradiction_diversity * contradiction_entropy)
        
        # Confidence adjustment (more constraints = higher confidence)
        confidence = min(1.0, total / 10.0)  # 10+ constraints gives full confidence
        
        # Final PAI
        pai_score = raw_pai * (0.5 + 0.5 * confidence)  # Scale with confidence

        # Print breakdown
        breakdown = f"""
📊 PAI DETAILED BREAKDOWN:
   Constraint Distribution:
     • Waiting Period: {type_counts['waiting_period']}
     • Age Limit: {type_counts['age_limit']}
     • Pre-existing: {type_counts['pre_existing']}
     • Disease Coverage: {type_counts['disease_coverage']}
   
   Contradictions by Type:
     • Waiting Period: {contradictions_by_type['waiting_period']}
     • Age Limit: {contradictions_by_type['age_limit']}
     • Pre-existing: {contradictions_by_type['pre_existing']}
     • Disease Coverage: {contradictions_by_type['disease_coverage']}
   
   Metrics:
     • Entropy (type diversity): {entropy:.3f}
     • Relative variance: {rel_variance:.3f}
     • Conflict score: {conflict:.3f}
     • Contradiction diversity: {contradiction_entropy:.3f}

📈 RAW PAI (before confidence): {raw_pai:.3f}
   Confidence multiplier: {confidence:.2f}
✅ FINAL PAI Score for {disease_name}: {pai_score:.3f}"""
        
        print(breakdown)
        report_lines.append(breakdown)
        
        if return_report:
            return pai_score, "\n".join(report_lines)
        return pai_score
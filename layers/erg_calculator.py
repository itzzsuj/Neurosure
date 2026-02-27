# layers/erg_calculator.py
import math

class ERGCalculator:
    """
    Calculates Exclusion Risk Gradient from constraint alignments
    ERG = 1 - exp(- (Weighted risk from contradictions) / (Total constraints))
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, return_report=False):
        """
        This method is called from app.py - it should receive alignments
        """
        # Check if we're getting alignments
        if retrieved_clauses and isinstance(retrieved_clauses[0], dict) and 'alignment_score' in retrieved_clauses[0]:
            return self.calculate_from_alignments(retrieved_clauses, disease_name, return_report)
        else:
            msg = f"\n📊 Calculating ERG for {disease_name} - No alignments found"
            print(msg)
            if return_report:
                return 0.0, msg
            return 0.0
    
    def calculate_from_alignments(self, alignments, disease_name, return_report=False):
        """
        Calculate ERG from constraint alignments
        
        Args:
            alignments: List of ConstraintAlignment objects from patient_aligner
            disease_name: Name of the disease being checked
            return_report: If True, returns (score, report_text) tuple
        """
        
        report_lines = []
        
        if not alignments:
            msg = f"\n📊 Calculating ERG for {disease_name} - No alignments found"
            print(msg)
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating ERG for {disease_name} from {len(alignments)} constraints"
        separator = "=" * 70
        line1 = "⚠️  Contradictions contribute directly to risk"
        line2 = "📈 Using nonlinear saturation: ERG = 1 - exp(-weighted_risk)"
        
        print(header)
        print(separator)
        print(line1)
        print(line2)
        print(separator)
        
        report_lines.append(header)
        report_lines.append(separator)
        report_lines.append(line1)
        report_lines.append(line2)
        report_lines.append(separator)

        total_risk_score = 0.0
        total_constraints = len(alignments)
        
        # Track risk by type
        risk_by_type = {
            'waiting_period': {'count': 0, 'risk': 0.0},
            'age_limit': {'count': 0, 'risk': 0.0},
            'pre_existing': {'count': 0, 'risk': 0.0},
            'disease_coverage': {'count': 0, 'risk': 0.0}
        }
        
        contradictions_count = 0

        for i, alignment in enumerate(alignments, 1):
            # Handle both dict and object
            if hasattr(alignment, 'to_dict'):
                alignment = alignment.to_dict()
                
            constraint = alignment.get('constraint', {})
            alignment_score = alignment.get('alignment_score', 0)
            contradiction = alignment.get('contradiction', False)
            risk_level = alignment.get('risk_level', 0)
            reason = alignment.get('contradiction_reason', '')
            
            constraint_type = constraint.get('type', 'unknown')
            
            if contradiction:
                contradictions_count += 1
                risk = risk_level
                total_risk_score += risk
                
                if constraint_type in risk_by_type:
                    risk_by_type[constraint_type]['count'] += 1
                    risk_by_type[constraint_type]['risk'] += risk
                
                line = f"   {i}. 🔴 CONTRADICTION ({constraint_type}): risk={risk:.2f}"
                if reason:
                    line += f"\n      → {reason}"
            else:
                risk = 0.0
                line = f"   {i}. ✅ SATISFIED ({constraint_type}): alignment={alignment_score:.2f}"
            
            print(line)
            report_lines.append(line)

        # Calculate weighted risk
        if total_constraints > 0:
            # Weighted risk - contradictions have higher weight
            weighted_risk = (total_risk_score * 1.5) / total_constraints
            weighted_risk = min(weighted_risk, 1.0)
            
            # Nonlinear saturation
            alpha = 0.9
            erg_score = 1 - math.exp(-alpha * weighted_risk)
        else:
            weighted_risk = 0.0
            erg_score = 0.0

        print(separator)
        report_lines.append(separator)
        
        # Risk breakdown by type
        breakdown = "\n📊 RISK BREAKDOWN BY TYPE:\n"
        for rtype, data in risk_by_type.items():
            if data['count'] > 0:
                breakdown += f"   • {rtype}: {data['count']} contradictions, avg risk {data['risk']/data['count']:.2f}\n"
        
        summary = f"""
📊 ERG DETAILED BREAKDOWN:
{breakdown}
   Raw Statistics:
     Total constraints: {total_constraints}
     Contradictions: {contradictions_count}
     Total risk score: {total_risk_score:.3f}
     Weighted risk: {weighted_risk:.3f}

   📈 Nonlinear Transformation:
     ERG = 1 - exp(-{weighted_risk:.3f}) = {erg_score:.3f}

📊 ERG SUMMARY:
   Contradiction rate: {contradictions_count/total_constraints*100:.1f}%
🔴 FINAL ERG Score for {disease_name}: {erg_score:.3f}"""
        
        print(summary)
        report_lines.append(summary)
        
        if return_report:
            return erg_score, "\n".join(report_lines)
        return erg_score
# layers/cds_calculator.py

class CDSCalculator:
    """
    Calculates Coverage Density Score from constraints and alignments
    CDS = (Weighted support from satisfied constraints) / (Total constraints)
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, return_report=False):
        """
        This method is called from app.py - it should receive alignments
        """
        # Check if we're getting alignments (they might be in retrieved_clauses)
        if retrieved_clauses and isinstance(retrieved_clauses[0], dict) and 'alignment_score' in retrieved_clauses[0]:
            # This is actually alignments data
            return self.calculate_from_alignments(retrieved_clauses, disease_name, return_report)
        else:
            # No alignments found
            msg = f"\n📊 Calculating CDS for {disease_name} - No alignments found"
            print(msg)
            if return_report:
                return 0.0, msg
            return 0.0
    
    def calculate_from_alignments(self, alignments, disease_name, return_report=False):
        """
        Calculate CDS from constraint alignments
        
        Args:
            alignments: List of ConstraintAlignment objects from patient_aligner
            disease_name: Name of the disease being checked
            return_report: If True, returns (score, report_text) tuple
        """
        
        report_lines = []
        
        if not alignments:
            msg = f"\n📊 Calculating CDS for {disease_name} - No alignments found"
            print(msg)
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating CDS for {disease_name} from {len(alignments)} constraints"
        separator = "-" * 50
        print(header)
        print(separator)
        report_lines.append(header)
        report_lines.append(separator)

        total_support_score = 0.0
        total_constraints = len(alignments)
        satisfied_constraints = 0
        partial_constraints = 0

        for i, alignment in enumerate(alignments, 1):
            # Handle both dict and object
            if hasattr(alignment, 'to_dict'):
                alignment = alignment.to_dict()
            
            constraint = alignment.get('constraint', {})
            alignment_score = alignment.get('alignment_score', 0)
            contradiction = alignment.get('contradiction', False)
            risk_level = alignment.get('risk_level', 0)
            
            constraint_type = constraint.get('type', 'unknown')
            condition = constraint.get('condition', 'general')
            
            # Support is based on alignment score
            support = alignment_score
            
            # Higher support for disease-specific constraints
            if condition == disease_name.lower():
                support *= 1.2
                support = min(support, 1.0)
            
            if alignment_score >= 0.9:
                satisfied_constraints += 1
                status = "✓✓ SATISFIED"
            elif alignment_score >= 0.5:
                partial_constraints += 1
                status = "✓ PARTIAL"
            else:
                status = "✗ UNSATISFIED"
            
            total_support_score += support
            
            line = f"   {i}. {status} ({constraint_type}): alignment={alignment_score:.2f} → support={support:.2f}"
            if contradiction:
                line += f" ⚠️ CONTRADICTION (risk={risk_level:.2f})"
            
            print(line)
            report_lines.append(line)

        # Calculate final CDS score
        if total_constraints > 0:
            cds_score = total_support_score / total_constraints
        else:
            cds_score = 0.0

        # Ensure score is between 0 and 1
        cds_score = max(0.0, min(cds_score, 1.0))

        print(separator)
        report_lines.append(separator)
        
        summary = f"""
📊 CDS SUMMARY:
   Total constraints evaluated: {total_constraints}
   Fully satisfied: {satisfied_constraints}
   Partially satisfied: {partial_constraints}
   Unsatisfied: {total_constraints - satisfied_constraints - partial_constraints}
   Total support score: {total_support_score:.3f}
✅ FINAL CDS Score for {disease_name}: {cds_score:.3f}"""
        
        print(summary)
        report_lines.append(summary)
        
        if return_report:
            return cds_score, "\n".join(report_lines)
        return cds_score
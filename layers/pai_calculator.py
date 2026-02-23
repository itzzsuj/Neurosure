# layers/pai_calculator.py
import math

class PAICalculator:
    """
    Calculates Policy Ambiguity Index from retrieved clauses
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, clause_embeddings=None, return_report=False):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            clause_embeddings: Optional embeddings for semantic similarity
            return_report: If True, returns (score, report_text) tuple
            
        Returns:
            pai_score: Single float between 0-1
            OR (score, report_text) if return_report=True
        """
        
        report_lines = []
        
        if not retrieved_clauses:
            msg = f"\n📊 Calculating PAI for {disease_name} - No clauses found"
            print(msg)
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating PAI for {disease_name} from {len(retrieved_clauses)} clauses"
        separator = "=" * 80
        print(header)
        print(separator)
        report_lines.append(header)
        report_lines.append(separator)

        # Filter weak matches
        strong_clauses = [c for c in retrieved_clauses if c.get('similarity_score', 0) >= 0.3]
        weak_count = len(retrieved_clauses) - len(strong_clauses)
        
        # Count categories
        coverage_count = len([c for c in strong_clauses if c.get('category') == 'Coverage'])
        exclusion_count = len([c for c in strong_clauses if c.get('category') == 'Exclusion'])
        waiting_count = len([c for c in strong_clauses if c.get('category') == 'Waiting Period'])
        general_count = len([c for c in strong_clauses if c.get('category') == 'General'])
        
        # Calculate entropy (diversity of categories)
        total = len(strong_clauses)
        if total > 0:
            proportions = []
            if coverage_count > 0:
                proportions.append(coverage_count / total)
            if exclusion_count > 0:
                proportions.append(exclusion_count / total)
            if waiting_count > 0:
                proportions.append(waiting_count / total)
            if general_count > 0:
                proportions.append(general_count / total)
            
            entropy = -sum(p * math.log(p) for p in proportions) / math.log(4) if proportions else 0
        else:
            entropy = 0
        
        # Calculate conflict score (ratio of opposing clauses)
        if coverage_count + exclusion_count > 0:
            conflict = exclusion_count / (coverage_count + exclusion_count)
        else:
            conflict = 0
        
        # Calculate relative variance
        categories = [coverage_count, exclusion_count, waiting_count, general_count]
        mean = sum(categories) / 4 if sum(categories) > 0 else 0
        variance = sum((x - mean) ** 2 for x in categories) / 4 if mean > 0 else 0
        rel_variance = variance / (mean ** 2 + 0.01) if mean > 0 else 0
        
        # Weights
        w_entropy = 0.2
        w_variance = 0.15
        w_conflict = 0.5
        w_similarity = 0.15
        
        # Semantic similarity (simplified - would need embeddings)
        semantic_similarity = 0.5  # Placeholder
        
        # Raw PAI
        raw_pai = (w_entropy * entropy + 
                   w_variance * rel_variance + 
                   w_conflict * conflict + 
                   w_similarity * semantic_similarity)
        
        # Confidence adjustment
        confidence = min(1.0, len(strong_clauses) / 6.0)
        
        # Final PAI
        pai_score = raw_pai * confidence

        line1 = f"📈 FINAL ENHANCED PAI: Conflict Dominant + Confidence Adjusted"
        line2 = separator
        line3 = f"\n   📊 Confidence adjustment: {confidence:.2f} ({len(strong_clauses)}/6 clauses)"
        line4 = separator
        
        print(line1)
        print(line2)
        print(line3)
        print(line4)
        
        report_lines.append(line1)
        report_lines.append(line2)
        report_lines.append(line3)
        report_lines.append(line4)
        
        breakdown = f"""
📊 PAI DETAILED BREAKDOWN:
   📊 Entropy (20% weight): {entropy:.3f}
   📉 Relative variance (15% weight): {rel_variance:.3f}
   ⚔️  Conflict score (50% weight): {conflict:.3f}
   🔬 Semantic similarity (15% weight): {semantic_similarity:.3f}

   📚 Categories: Coverage={coverage_count}, Exclusion={exclusion_count}, Waiting={waiting_count}, General={general_count}

📈 RAW PAI (before confidence): {raw_pai:.3f}
   Confidence multiplier: {confidence:.2f}
✅ FINAL PAI Score for {disease_name}: {pai_score:.3f}"""
        
        print(breakdown)
        report_lines.append(breakdown)
        
        if return_report:
            return pai_score, "\n".join(report_lines)
        return pai_score
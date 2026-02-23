# layers/cds_calculator.py

class CDSCalculator:
    """
    Calculates Coverage Density Score from retrieved clauses
    CDS = (Weighted support from Coverage clauses) / (Total relevance of all relevant clauses)
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, return_report=False):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            return_report: If True, returns (score, report_text) tuple
            
        Returns:
            cds_score: Single float between 0-1
            OR (score, report_text) if return_report=True
        """
        
        report_lines = []
        
        if not retrieved_clauses:
            msg = f"\n📊 Calculating CDS for {disease_name} - No clauses found"
            print(msg)  # Keep for terminal
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating CDS for {disease_name} from {len(retrieved_clauses)} clauses"
        separator = "-" * 50
        print(header)
        print(separator)
        report_lines.append(header)
        report_lines.append(separator)

        total_support_score = 0.0
        total_relevance = 0.0
        weak_matches_skipped = 0

        for i, clause in enumerate(retrieved_clauses, 1):
            relevance = clause.get('similarity_score', 0)
            category = clause.get('category', 'General')
            disease_mentioned = clause.get('disease_mentioned', False)
            
            # Ignore weak matches (relevance < 0.3)
            if relevance < 0.3:
                weak_matches_skipped += 1
                line = f"   {i}. ⚠️ Skipped (weak): {category} - rel={relevance:.2f}"
                print(line)
                report_lines.append(line)
                continue

            # Add to denominator - ALL relevant clauses count in total_relevance
            total_relevance += relevance

            # Only Coverage clauses contribute to support score
            if category == 'Coverage':
                support = relevance
                
                # Boost if disease is directly mentioned
                if disease_mentioned:
                    support *= 1.5
                    line = f"   {i}. ✓✓ COVERAGE (with mention): rel={relevance:.2f} → support={support:.2f}"
                else:
                    line = f"   {i}. ✓ COVERAGE: rel={relevance:.2f} → support={support:.2f}"
                
                print(line)
                report_lines.append(line)
                total_support_score += support

            elif category == 'Exclusion':
                line = f"   {i}. ✗ EXCLUSION: rel={relevance:.2f} (adds to denominator only)"
                print(line)
                report_lines.append(line)

            else:  # General, Waiting Period, etc.
                line = f"   {i}. • GENERAL: rel={relevance:.2f} (adds to denominator only)"
                print(line)
                report_lines.append(line)

        # Calculate final CDS score
        if total_relevance > 0:
            cds_score = total_support_score / total_relevance
        else:
            cds_score = 0.0

        # Ensure score is between 0 and 1
        cds_score = max(0.0, min(cds_score, 1.0))

        print(separator)
        report_lines.append(separator)
        
        summary = f"""
📊 SUMMARY:
   Total clauses received: {len(retrieved_clauses)}
   Weak matches skipped (relevance < 0.3): {weak_matches_skipped}
   Clauses used in calculation: {len(retrieved_clauses) - weak_matches_skipped}
   Total support score: {total_support_score:.3f}
   Total relevance (denominator): {total_relevance:.3f}
✅ FINAL CDS Score for {disease_name}: {cds_score:.3f}"""
        
        print(summary)
        report_lines.append(summary)
        
        if return_report:
            return cds_score, "\n".join(report_lines)
        return cds_score
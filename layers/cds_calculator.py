# layers/cds_calculator.py

class CDSCalculator:
    """
    Calculates Coverage Density Score from retrieved clauses
    CDS = (Weighted support from Coverage clauses) / (Total relevance of all relevant clauses)
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            
        Returns:
            cds_score: Single float between 0-1
        """
        
        if not retrieved_clauses:
            print(f"\n📊 Calculating CDS for {disease_name} - No clauses found")
            return 0.0

        print(f"\n📊 Calculating CDS for {disease_name} from {len(retrieved_clauses)} clauses")
        print("-" * 50)

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
                print(f"   {i}. ⚠️ Skipped (weak): {category} - rel={relevance:.2f}")
                continue

            # Add to denominator - ALL relevant clauses count in total_relevance
            total_relevance += relevance

            # Only Coverage clauses contribute to support score
            if category == 'Coverage':
                support = relevance
                
                # Boost if disease is directly mentioned
                if disease_mentioned:
                    support *= 1.5
                    print(f"   {i}. ✓✓ COVERAGE (with mention): rel={relevance:.2f} → support={support:.2f}")
                else:
                    print(f"   {i}. ✓ COVERAGE: rel={relevance:.2f} → support={support:.2f}")
                
                total_support_score += support

            elif category == 'Exclusion':
                print(f"   {i}. ✗ EXCLUSION: rel={relevance:.2f} (adds to denominator only)")

            else:  # General, Waiting Period, etc.
                print(f"   {i}. • GENERAL: rel={relevance:.2f} (adds to denominator only)")

        # Calculate final CDS score
        if total_relevance > 0:
            cds_score = total_support_score / total_relevance
        else:
            cds_score = 0.0

        # Ensure score is between 0 and 1
        cds_score = max(0.0, min(cds_score, 1.0))

        print("-" * 50)
        print(f"\n📊 SUMMARY:")
        print(f"   Total clauses received: {len(retrieved_clauses)}")
        print(f"   Weak matches skipped (relevance < 0.3): {weak_matches_skipped}")
        print(f"   Clauses used in calculation: {len(retrieved_clauses) - weak_matches_skipped}")
        print(f"   Total support score: {total_support_score:.3f}")
        print(f"   Total relevance (denominator): {total_relevance:.3f}")
        print(f"✅ FINAL CDS Score for {disease_name}: {cds_score:.3f}")
        
        return cds_score


# Optional: Add a convenience method to calculate from API response
def calculate_cds_from_api_response(api_response, disease_name):
    """
    Helper function to calculate CDS directly from API JSON response
    """
    if not api_response or not api_response.get('success'):
        return 0.0
    
    clauses = api_response.get('clauses', [])
    calculator = CDSCalculator()
    return calculator.calculate_from_retrieved_clauses(clauses, disease_name)
# layers/erg_calculator.py
import math

class ERGCalculator:
    """
    Calculates Exclusion Risk Gradient from retrieved clauses
    ERG = 1 - exp(- (Weighted risk from Exclusion and Waiting Period clauses) / 
                 (Total relevance of meaningful clauses))
    
    Features:
    - Waiting Period = Delayed exclusion (counts as risk)
    - General clauses ignored (don't affect score)
    - Nonlinear saturation preserves severity differences
    - No hard clipping, smooth asymptotic approach to 1.0
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            
        Returns:
            erg_score: Single float between 0-1 (higher = more risk)
        """
        
        if not retrieved_clauses:
            print(f"\n📊 Calculating ERG for {disease_name} - No clauses found")
            return 0.0

        print(f"\n📊 Calculating ERG for {disease_name} from {len(retrieved_clauses)} clauses")
        print("=" * 70)
        print("⚠️  Waiting Period clauses count as RISK (delayed exclusion)")
        print("⚪ General/Definition clauses IGNORED (don't affect score)")
        print("📈 Using nonlinear saturation: ERG = 1 - exp(-raw_risk)")
        print("=" * 70)

        total_risk_score = 0.0
        total_meaningful_relevance = 0.0  # Only Coverage + Exclusion + Waiting Period
        weak_matches_skipped = 0
        general_clauses_ignored = 0
        
        # Track contribution details
        exclusion_count = 0
        waiting_count = 0
        exclusion_with_mention_count = 0
        waiting_with_mention_count = 0

        for i, clause in enumerate(retrieved_clauses, 1):
            relevance = clause.get('similarity_score', 0)
            category = clause.get('category', 'General')
            disease_mentioned = clause.get('disease_mentioned', False)
            
            # Ignore weak matches (same threshold as CDS)
            if relevance < 0.3:
                weak_matches_skipped += 1
                print(f"   {i}. ⚠️ SKIPPED (weak): {category} - rel={relevance:.2f}")
                continue

            # Only count meaningful categories in denominator
            if category in ['Coverage', 'Exclusion', 'Waiting Period']:
                total_meaningful_relevance += relevance
            else:
                general_clauses_ignored += 1
                print(f"   {i}. ⚪ IGNORED (General): {category} - rel={relevance:.2f}")
                continue

            # Calculate RISK contributions
            if category == 'Exclusion':
                risk = relevance
                exclusion_count += 1
                
                # Much higher risk if disease is directly mentioned in exclusion
                if disease_mentioned:
                    risk *= 2.0  # 100% boost for direct mention in exclusion
                    exclusion_with_mention_count += 1
                    print(f"   {i}. 🔴🔴 EXCLUSION (with mention): rel={relevance:.2f} → risk={risk:.2f}")
                else:
                    print(f"   {i}. 🔴 EXCLUSION: rel={relevance:.2f} → risk={risk:.2f}")
                
                total_risk_score += risk

            elif category == 'Waiting Period':
                risk = relevance * 0.8  # Waiting period = 80% of exclusion risk
                waiting_count += 1
                
                # If disease mentioned in waiting period, higher risk
                if disease_mentioned:
                    risk *= 1.5  # 50% boost
                    waiting_with_mention_count += 1
                    print(f"   {i}. 🟠🟠 WAITING (with mention): rel={relevance:.2f} → risk={risk:.2f}")
                else:
                    print(f"   {i}. 🟠 WAITING: rel={relevance:.2f} → risk={risk:.2f}")
                
                total_risk_score += risk

            elif category == 'Coverage':
                print(f"   {i}. ✅ COVERAGE: rel={relevance:.2f} (adds to denominator only)")

        # Calculate raw risk ratio
        if total_meaningful_relevance > 0:
            raw_risk = total_risk_score / total_meaningful_relevance
        else:
            raw_risk = 0.0

        # 🎯 NONLINEAR SATURATION: 1 - exp(-raw_risk)
        # This preserves differences at high end without clipping
        alpha = 0.9
        erg_score = 1 - math.exp(-alpha * raw_risk)

        print("=" * 70)
        print(f"\n📊 ERG DETAILED BREAKDOWN:")
        print(f"   Risk Contributions:")
        print(f"     - Exclusions: {exclusion_count} total ({exclusion_with_mention_count} with mention)")
        print(f"     - Waiting periods: {waiting_count} total ({waiting_with_mention_count} with mention)")
        print(f"\n   Raw Statistics:")
        print(f"     Total risk score: {total_risk_score:.3f}")
        print(f"     Total meaningful relevance: {total_meaningful_relevance:.3f}")
        print(f"     Raw risk ratio: {raw_risk:.3f}")
        print(f"\n   📈 Nonlinear Transformation:")
        print(f"     ERG = 1 - exp(-{raw_risk:.3f}) = {erg_score:.3f}")
        print(f"\n📊 ERG SUMMARY:")
        print(f"   Total clauses received: {len(retrieved_clauses)}")
        print(f"   Weak matches skipped (rel<0.3): {weak_matches_skipped}")
        print(f"   General clauses ignored: {general_clauses_ignored}")
        print(f"   Meaningful clauses used: {len(retrieved_clauses) - weak_matches_skipped - general_clauses_ignored}")
        print(f"🔴 FINAL ERG Score for {disease_name}: {erg_score:.3f}")
        
        return erg_score
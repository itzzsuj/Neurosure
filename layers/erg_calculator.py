# layers/erg_calculator.py
import math

class ERGCalculator:
    """
    Calculates Exclusion Risk Gradient from retrieved clauses
    ERG = 1 - exp(- (Weighted risk from Exclusion and Waiting Period clauses) / 
                 (Total relevance of meaningful clauses))
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, return_report=False):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            return_report: If True, returns (score, report_text) tuple
            
        Returns:
            erg_score: Single float between 0-1
            OR (score, report_text) if return_report=True
        """
        
        report_lines = []
        
        if not retrieved_clauses:
            msg = f"\n📊 Calculating ERG for {disease_name} - No clauses found"
            print(msg)
            report_lines.append(msg)
            return (0.0, "\n".join(report_lines)) if return_report else 0.0

        header = f"\n📊 Calculating ERG for {disease_name} from {len(retrieved_clauses)} clauses"
        separator1 = "=" * 70
        separator2 = "=" * 70
        line1 = "⚠️  Waiting Period clauses count as RISK (delayed exclusion)"
        line2 = "⚪ General/Definition clauses IGNORED (don't affect score)"
        line3 = "📈 Using nonlinear saturation: ERG = 1 - exp(-raw_risk)"
        
        print(header)
        print(separator1)
        print(line1)
        print(line2)
        print(line3)
        print(separator2)
        
        report_lines.append(header)
        report_lines.append(separator1)
        report_lines.append(line1)
        report_lines.append(line2)
        report_lines.append(line3)
        report_lines.append(separator2)

        total_risk_score = 0.0
        total_meaningful_relevance = 0.0
        weak_matches_skipped = 0
        general_clauses_ignored = 0
        
        exclusion_count = 0
        waiting_count = 0
        exclusion_with_mention_count = 0
        waiting_with_mention_count = 0

        for i, clause in enumerate(retrieved_clauses, 1):
            relevance = clause.get('similarity_score', 0)
            category = clause.get('category', 'General')
            disease_mentioned = clause.get('disease_mentioned', False)
            
            if relevance < 0.3:
                weak_matches_skipped += 1
                line = f"   {i}. ⚠️ SKIPPED (weak): {category} - rel={relevance:.2f}"
                print(line)
                report_lines.append(line)
                continue

            if category in ['Coverage', 'Exclusion', 'Waiting Period']:
                total_meaningful_relevance += relevance
            else:
                general_clauses_ignored += 1
                line = f"   {i}. ⚪ IGNORED (General): {category} - rel={relevance:.2f}"
                print(line)
                report_lines.append(line)
                continue

            if category == 'Exclusion':
                risk = relevance
                exclusion_count += 1
                
                if disease_mentioned:
                    risk *= 2.0
                    exclusion_with_mention_count += 1
                    line = f"   {i}. 🔴🔴 EXCLUSION (with mention): rel={relevance:.2f} → risk={risk:.2f}"
                else:
                    line = f"   {i}. 🔴 EXCLUSION: rel={relevance:.2f} → risk={risk:.2f}"
                
                print(line)
                report_lines.append(line)
                total_risk_score += risk

            elif category == 'Waiting Period':
                risk = relevance * 0.8
                waiting_count += 1
                
                if disease_mentioned:
                    risk *= 1.5
                    waiting_with_mention_count += 1
                    line = f"   {i}. 🟠🟠 WAITING (with mention): rel={relevance:.2f} → risk={risk:.2f}"
                else:
                    line = f"   {i}. 🟠 WAITING: rel={relevance:.2f} → risk={risk:.2f}"
                
                print(line)
                report_lines.append(line)
                total_risk_score += risk

            elif category == 'Coverage':
                line = f"   {i}. ✅ COVERAGE: rel={relevance:.2f} (adds to denominator only)"
                print(line)
                report_lines.append(line)

        if total_meaningful_relevance > 0:
            raw_risk = total_risk_score / total_meaningful_relevance
        else:
            raw_risk = 0.0

        alpha = 0.9
        erg_score = 1 - math.exp(-alpha * raw_risk)

        print(separator2)
        report_lines.append(separator2)
        
        breakdown = f"""
📊 ERG DETAILED BREAKDOWN:
   Risk Contributions:
     - Exclusions: {exclusion_count} total ({exclusion_with_mention_count} with mention)
     - Waiting periods: {waiting_count} total ({waiting_with_mention_count} with mention)

   Raw Statistics:
     Total risk score: {total_risk_score:.3f}
     Total meaningful relevance: {total_meaningful_relevance:.3f}
     Raw risk ratio: {raw_risk:.3f}

   📈 Nonlinear Transformation:
     ERG = 1 - exp(-{raw_risk:.3f}) = {erg_score:.3f}

📊 ERG SUMMARY:
   Total clauses received: {len(retrieved_clauses)}
   Weak matches skipped (rel<0.3): {weak_matches_skipped}
   General clauses ignored: {general_clauses_ignored}
   Meaningful clauses used: {len(retrieved_clauses) - weak_matches_skipped - general_clauses_ignored}
🔴 FINAL ERG Score for {disease_name}: {erg_score:.3f}"""
        
        print(breakdown)
        report_lines.append(breakdown)
        
        if return_report:
            return erg_score, "\n".join(report_lines)
        return erg_score
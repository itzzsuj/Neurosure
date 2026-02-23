# layers/pai_calculator.py
import math
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class PAICalculator:
    """
    Calculates Policy Ambiguity Index from clause embeddings
    PAI = Measures uncertainty in policy interpretation
    
    FINAL ENHANCED VERSION:
    - Conflict-dominant weighting (50%)
    - Entropy downscaled when no conflict
    - Confidence adjustment for few clauses
    - Semantic similarity as heuristic (not true contradiction)
    - Relative variance normalization
    - NO vector storage (just returns score)
    """
    
    def calculate_from_retrieved_clauses(self, retrieved_clauses, disease_name, clause_embeddings=None):
        """
        Args:
            retrieved_clauses: List of clause dicts from /api/analysis/extract
            disease_name: Name of the disease being checked
            clause_embeddings: Optional list of actual embedding vectors
            
        Returns:
            pai_score: Single float between 0-1 (higher = more ambiguous)
        """
        
        if not retrieved_clauses or len(retrieved_clauses) < 2:
            print(f"\n📊 Calculating PAI for {disease_name} - Not enough clauses")
            return 0.2  # Low baseline ambiguity

        print(f"\n📊 Calculating PAI for {disease_name} from {len(retrieved_clauses)} clauses")
        print("=" * 80)
        print("📈 FINAL ENHANCED PAI: Conflict Dominant + Confidence Adjusted")
        print("=" * 80)

        # Extract relevance scores and categories
        relevance_scores = []
        categories = []
        coverage_embeddings = []
        exclusion_embeddings = []
        waiting_embeddings = []
        
        for i, clause in enumerate(retrieved_clauses):
            relevance = clause.get('similarity_score', 0)
            category = clause.get('category', 'General')
            
            # Only use meaningful clauses (relevance > 0.3)
            if relevance >= 0.3:
                relevance_scores.append(relevance)
                categories.append(category)
                
                # Store embeddings by category if available
                if clause_embeddings and i < len(clause_embeddings):
                    if category == 'Coverage':
                        coverage_embeddings.append(clause_embeddings[i])
                    elif category == 'Exclusion':
                        exclusion_embeddings.append(clause_embeddings[i])
                    elif category == 'Waiting Period':
                        waiting_embeddings.append(clause_embeddings[i])
        
        if len(relevance_scores) < 2:
            print("   Not enough meaningful clauses for PAI calculation")
            return 0.2
        
        # 1️⃣ ENTROPY CALCULATION (measures dispersion)
        relevance_array = np.array(relevance_scores)
        prob_dist = relevance_array / np.sum(relevance_array)
        entropy = -np.sum(prob_dist * np.log2(prob_dist + 1e-10))
        max_entropy = np.log2(len(relevance_scores))
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        
        # 2️⃣ RELATIVE VARIANCE (normalized by mean)
        mean_relevance = np.mean(relevance_scores)
        variance = np.var(relevance_scores)
        if mean_relevance > 0:
            relative_variance = variance / (mean_relevance + 1e-6)
            normalized_variance = min(relative_variance / 2.0, 1.0)  # Cap at 2x mean
        else:
            normalized_variance = 0
        
        # 3️⃣ CONFLICT SCORE (dominant weight)
        has_coverage = 'Coverage' in categories
        has_exclusion = 'Exclusion' in categories
        has_waiting = 'Waiting Period' in categories
        
        if has_coverage and (has_exclusion or has_waiting):
            total_meaningful = len(categories)
            conflict_count = categories.count('Exclusion') + categories.count('Waiting Period')
            conflict_ratio = conflict_count / total_meaningful
            conflict_score = min(conflict_ratio * 1.5, 1.0)  # Scale but cap
        else:
            conflict_score = 0.0
        
        # 4️⃣ SEMANTIC SIMILARITY (heuristic, not true contradiction)
        semantic_similarity = 0.0
        if coverage_embeddings and (exclusion_embeddings or waiting_embeddings):
            # Average coverage embedding
            avg_coverage = np.mean(coverage_embeddings, axis=0)
            
            # Combine exclusion and waiting embeddings
            risk_embeddings = exclusion_embeddings + waiting_embeddings
            if risk_embeddings:
                avg_risk = np.mean(risk_embeddings, axis=0)
                
                # Calculate cosine similarity between coverage and risk concepts
                similarity = cosine_similarity([avg_coverage], [avg_risk])[0][0]
                
                # Convert to heuristic score (0-1 scale)
                if similarity > 0.6:
                    semantic_similarity = (similarity - 0.6) * 2.5  # Scale 0.6-1.0 to 0-1
                    semantic_similarity = min(semantic_similarity, 1.0)
                
                print(f"   🔬 Semantic similarity (coverage vs risk): {similarity:.3f} → heuristic={semantic_similarity:.3f}")
                print(f"      ⚠️  Note: This measures topical similarity, not contradiction direction")
        
        # 5️⃣ APPLY ENTROPY DOWNSCALING WHEN NO CONFLICT
        if conflict_score == 0:
            normalized_entropy *= 0.5
            print(f"   📉 No conflict detected - entropy downscaled to {normalized_entropy:.3f}")
        
        # 6️⃣ COMBINE INTO RAW PAI (before confidence adjustment)
        # Conflict: 50%, Entropy: 20%, Variance: 15%, Semantic: 15%
        raw_pai = (
            normalized_entropy * 0.20 +
            normalized_variance * 0.15 +
            conflict_score * 0.50 +
            semantic_similarity * 0.15
        )
        raw_pai = min(max(raw_pai, 0.0), 1.0)
        
        # 7️⃣ CONFIDENCE ADJUSTMENT (fewer clauses = less confidence)
        meaningful_clauses = len(relevance_scores)
        confidence = min(1.0, meaningful_clauses / 6.0)  # Need 6+ clauses for full confidence
        
        # Apply confidence to PAI
        pai_score = raw_pai * confidence
        
        # If very few clauses, also add small baseline
        if meaningful_clauses < 3 and raw_pai < 0.3:
            pai_score = max(pai_score, 0.15)  # Minimum floor for very few clauses
        
        print(f"\n   📊 Confidence adjustment: {confidence:.2f} ({meaningful_clauses}/6 clauses)")
        
        print("=" * 80)
        print(f"\n📊 PAI DETAILED BREAKDOWN:")
        print(f"   📊 Entropy (20% weight): {normalized_entropy:.3f}")
        print(f"   📉 Relative variance (15% weight): {normalized_variance:.3f}")
        print(f"   ⚔️  Conflict score (50% weight): {conflict_score:.3f}")
        print(f"   🔬 Semantic similarity (15% weight): {semantic_similarity:.3f}")
        print(f"\n   📚 Categories: Coverage={categories.count('Coverage')}, "
              f"Exclusion={categories.count('Exclusion')}, Waiting={categories.count('Waiting Period')}")
        print(f"\n📈 RAW PAI (before confidence): {raw_pai:.3f}")
        print(f"   Confidence multiplier: {confidence:.2f}")
        print(f"✅ FINAL PAI Score for {disease_name}: {pai_score:.3f}")
        
        return pai_score
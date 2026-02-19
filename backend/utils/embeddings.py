from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any, Union
import logging

logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """Initialize the embedding model"""
        try:
            self.model = SentenceTransformer(model_name)
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            logger.info(f"Loaded embedding model: {model_name} (dim={self.embedding_dim})")
        except Exception as e:
            logger.error(f"Error loading embedding model: {str(e)}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts"""
        try:
            embeddings = self.model.encode(
                texts,
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True
            )
            return embeddings
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            raise
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        return self.generate_embeddings([text])[0]
    
    def generate_disease_queries(self, disease_name: str, category: str) -> List[str]:
        """Generate multiple query variations for a disease"""
        
        # Base queries
        base_queries = [
            f"{disease_name} coverage",
            f"{disease_name} exclusion",
            f"{disease_name} waiting period",
            f"{disease_name} pre-existing condition",
            f"{disease_name} treatment",
            f"{disease_name} benefits",
            f"{disease_name} claim",
        ]
        
        # Question-based queries (better for semantic search)
        question_queries = [
            f"is {disease_name} covered by this insurance",
            f"does this policy cover {disease_name}",
            f"are there any exclusions for {disease_name}",
            f"what is the waiting period for {disease_name}",
            f"how to claim for {disease_name} treatment",
            f"is {disease_name} considered a pre-existing condition",
            f"what treatments are covered for {disease_name}",
            f"are there any limitations for {disease_name}",
            f"can i get coverage for {disease_name}",
            f"will my policy pay for {disease_name}",
        ]
        
        # Category-specific queries
        category_queries = [
            f"{disease_name} {category} condition",
            f"{category} disease {disease_name} coverage",
            f"treatment for {disease_name} {category} disorder",
            f"{disease_name} {category} medical expenses",
        ]
        
        # Legal/policy language queries
        policy_queries = [
            f"with respect to {disease_name}",
            f"in the event of {disease_name}",
            f"should the insured develop {disease_name}",
            f"diagnosis of {disease_name}",
            f"treatment of {disease_name}",
            f"expenses related to {disease_name}",
            f"hospitalization for {disease_name}",
        ]
        
        # Combine all queries
        all_queries = base_queries + question_queries + category_queries + policy_queries
        
        # Remove duplicates while preserving order
        seen = set()
        unique_queries = []
        for query in all_queries:
            if query not in seen:
                seen.add(query)
                unique_queries.append(query)
        
        return unique_queries
    
    def generate_enhanced_embedding(self, disease_name: str, category: str) -> np.ndarray:
        """Generate an enhanced embedding using multiple queries"""
        queries = self.generate_disease_queries(disease_name, category)
        
        # Add a comprehensive summary query
        summary_query = f"{disease_name} {category} medical condition coverage exclusion treatment policy benefits claim waiting period pre-existing"
        all_queries = [summary_query] + queries
        
        # Generate embeddings for all queries
        query_embeddings = self.generate_embeddings(all_queries)
        
        # Weighted average (give more weight to the summary query)
        weights = np.ones(len(all_queries))
        weights[0] = 2.0  # Double weight for summary query
        
        weighted_embeddings = query_embeddings * weights[:, np.newaxis]
        enhanced_embedding = np.sum(weighted_embeddings, axis=0) / np.sum(weights)
        
        # Normalize
        enhanced_embedding = enhanced_embedding / np.linalg.norm(enhanced_embedding)
        
        logger.info(f"Generated enhanced embedding for {disease_name} using {len(all_queries)} queries")
        return enhanced_embedding
    
    def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings"""
        return float(np.dot(embedding1, embedding2))
    
    def compute_similarities(self, query_embedding: np.ndarray, embeddings: np.ndarray) -> np.ndarray:
        """Compute cosine similarities between query and multiple embeddings"""
        return np.dot(embeddings, query_embedding)
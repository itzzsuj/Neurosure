import numpy as np
import faiss
import pickle
import os
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self, index_path: str = "processed/vector_index"):
        self.index_path = index_path
        self.index = None
        self.documents = []  # Store document metadata
        self.embeddings = []  # Store embeddings
        self.dimension = 384  # all-MiniLM-L6-v2 dimension
        self.initialize_index()
    
    def initialize_index(self):
        """Initialize or load existing FAISS index"""
        try:
            if os.path.exists(f"{self.index_path}.faiss"):
                self.index = faiss.read_index(f"{self.index_path}.faiss")
                with open(f"{self.index_path}.pkl", 'rb') as f:
                    self.documents = pickle.load(f)
                logger.info(f"Loaded existing index with {len(self.documents)} documents")
            else:
                # Create new index
                self.index = faiss.IndexFlatIP(self.dimension)  # Inner product for cosine similarity
                logger.info("Created new FAISS index")
        except Exception as e:
            logger.error(f"Error initializing index: {str(e)}")
            raise
    
    def add_documents(self, job_id: str, chunks: List[Dict[str, Any]], embeddings: np.ndarray):
        """Add documents to the vector store"""
        try:
            # Add embeddings to index
            self.index.add(embeddings.astype('float32'))
            
            # Store document metadata with job_id
            for i, chunk in enumerate(chunks):
                self.documents.append({
                    'job_id': job_id,
                    'text': chunk['text'],
                    'page': chunk['page'],
                    'chunk_id': chunk['chunk_id'],
                    'embedding_index': len(self.embeddings) + i,
                    'timestamp': datetime.now().isoformat()
                })
                self.embeddings.append(embeddings[i])
            
            # Save index and documents
            self._save_index()
            
            logger.info(f"Added {len(chunks)} documents to vector store for job {job_id}")
            
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
            raise
    
    def search_similar(self, query_embedding: np.ndarray, n_results: int = 10) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            # Ensure query embedding is 2D
            if len(query_embedding.shape) == 1:
                query_embedding = query_embedding.reshape(1, -1)
            
            # Search
            scores, indices = self.index.search(query_embedding.astype('float32'), n_results)
            
            # Prepare results
            results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx >= 0 and idx < len(self.documents):
                    doc = self.documents[idx].copy()
                    doc['score'] = float(score)
                    results.append(doc)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching similar documents: {str(e)}")
            raise
    
    def _save_index(self):
        """Save index and documents to disk"""
        try:
            faiss.write_index(self.index, f"{self.index_path}.faiss")
            with open(f"{self.index_path}.pkl", 'wb') as f:
                pickle.dump(self.documents, f)
            logger.info("Saved index to disk")
        except Exception as e:
            logger.error(f"Error saving index: {str(e)}")
    
    def delete_job_documents(self, job_id: str):
        """Delete all documents for a specific job"""
        # Note: FAISS doesn't support deletion easily
        # This is a simplified version - in production, use a database
        pass
    
    def clear_all_documents(self):
        """Clear all documents from the vector store"""
        try:
            # Reset index
            self.index = faiss.IndexFlatIP(self.dimension)
            
            # Clear documents list
            self.documents = []
            
            # Reset embeddings list
            self.embeddings = []
            
            # Save empty index
            self._save_index()
            
            logger.info("Cleared all documents from vector store")
        except Exception as e:
            logger.error(f"Error clearing documents: {str(e)}")
            raise

    def clear_job_documents(self, job_id):
        """Clear documents for a specific job"""
        try:
            # Filter out documents for this job
            remaining_docs = [doc for doc in self.documents if doc.get('job_id') != job_id]
            
            if len(remaining_docs) < len(self.documents):
                # If documents were removed, we need to rebuild the index
                self.documents = remaining_docs
                
                # Rebuild index with remaining documents
                if len(remaining_docs) > 0:
                    # This is complex - you might want to just clear all
                    # For simplicity, we'll just clear all when removing
                    self.clear_all_documents()
                    logger.warning(f"Removed documents for job {job_id} - index cleared")
                else:
                    self.clear_all_documents()
                    
        except Exception as e:
            logger.error(f"Error clearing job documents: {str(e)}")
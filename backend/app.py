import os
import uuid
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import redis
from celery import Celery
import threading
import time

from utils.pdf_processor import PDFProcessor
from utils.embeddings import EmbeddingGenerator
from utils.vector_store import VectorStore
from utils.clause_analyzer import ClauseAnalyzer
from models.schema import AnalysisJob, Clause, Disease

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['PROCESSED_FOLDER'] = 'processed'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

# Redis configuration for job queue
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
app.config['REDIS_URL'] = redis_url

# Initialize components
pdf_processor = PDFProcessor()
embedding_generator = EmbeddingGenerator()
vector_store = VectorStore()
clause_analyzer = ClauseAnalyzer()

# In-memory storage for jobs (replace with database in production)
jobs = {}
job_locks = {}

# Disease embeddings cache
disease_embeddings = {}
disease_categories = {}

# Pre-defined disease list with categories
DISEASES = [
    {"value": "diabetes_type_2", "label": "Diabetes Type 2", "category": "Endocrine"},
    {"value": "hypertension", "label": "Hypertension", "category": "Cardiovascular"},
    {"value": "coronary_artery_disease", "label": "Coronary Artery Disease", "category": "Cardiovascular"},
    {"value": "copd", "label": "COPD", "category": "Respiratory"},
    {"value": "asthma", "label": "Asthma", "category": "Respiratory"},
    {"value": "arthritis_rheumatoid", "label": "Rheumatoid Arthritis", "category": "Autoimmune"},
    {"value": "osteoarthritis", "label": "Osteoarthritis", "category": "Musculoskeletal"},
    {"value": "chronic_kidney_disease", "label": "Chronic Kidney Disease", "category": "Renal"},
    {"value": "breast_cancer", "label": "Breast Cancer", "category": "Oncology"},
    {"value": "lung_cancer", "label": "Lung Cancer", "category": "Oncology"},
    {"value": "prostate_cancer", "label": "Prostate Cancer", "category": "Oncology"},
    {"value": "alzheimers", "label": "Alzheimer's Disease", "category": "Neurological"},
    {"value": "parkinsons", "label": "Parkinson's Disease", "category": "Neurological"},
    {"value": "multiple_sclerosis", "label": "Multiple Sclerosis", "category": "Neurological"},
    {"value": "depression_major", "label": "Major Depression", "category": "Mental Health"},
    {"value": "anxiety_disorder", "label": "Anxiety Disorder", "category": "Mental Health"},
    {"value": "bipolar_disorder", "label": "Bipolar Disorder", "category": "Mental Health"},
    {"value": "crohns_disease", "label": "Crohn's Disease", "category": "Gastrointestinal"},
    {"value": "ulcerative_colitis", "label": "Ulcerative Colitis", "category": "Gastrointestinal"},
    {"value": "hepatitis_c", "label": "Hepatitis C", "category": "Infectious"},
    {"value": "hiv_aids", "label": "HIV/AIDS", "category": "Infectious"},
    {"value": "thyroid_disorders", "label": "Thyroid Disorders", "category": "Endocrine"},
    {"value": "sleep_apnea", "label": "Sleep Apnea", "category": "Respiratory"},
    {"value": "migraine_chronic", "label": "Chronic Migraine", "category": "Neurological"},
]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/api/analysis/diseases', methods=['GET'])
def get_diseases():
    """Return list of supported diseases"""
    return jsonify({
        'success': True,
        'diseases': DISEASES
    })

@app.route('/api/analysis/upload', methods=['POST'])
def upload_file():
    """Handle PDF upload and start processing"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'success': False, 'error': 'File type not allowed. Please upload PDF.'}), 400
        
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Secure filename and save
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{job_id}_{filename}")
        file.save(file_path)
        
        # IMPORTANT: Clear ALL previous documents from vector store
        # This ensures no old document chunks remain
        logger.info("Clearing all previous documents from vector store...")
        vector_store.clear_all_documents()
        
        # Create job record
        jobs[job_id] = {
            'job_id': job_id,
            'filename': filename,
            'file_path': file_path,
            'status': 'pending',
            'progress': 0,
            'created_at': datetime.now().isoformat()
        }
        
        # Start processing in background thread
        thread = threading.Thread(target=process_pdf_background, args=(job_id,))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'File uploaded successfully. Previous documents cleared. Processing started.'
        })
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

def process_pdf_background(job_id):
    """Background PDF processing"""
    try:
        job = jobs.get(job_id)
        if not job:
            return
        
        job['status'] = 'processing'
        job['progress'] = 10
        
        # Extract text from PDF
        text_chunks = pdf_processor.extract_text(job['file_path'])
        job['progress'] = 30
        
        # Generate embeddings for chunks
        texts = [chunk['text'] for chunk in text_chunks]
        chunk_embeddings = embedding_generator.generate_embeddings(texts)
        job['progress'] = 60
        
        # IMPORTANT: Clear any existing documents for this job first
        # This is a safety measure in case clear_all_documents wasn't called
        vector_store.clear_job_documents(job_id)
        
        # Store in vector database
        vector_store.add_documents(job_id, text_chunks, chunk_embeddings)
        job['progress'] = 90
        
        # Pre-compute disease embeddings
        precompute_disease_embeddings()
        
        job['status'] = 'completed'
        job['progress'] = 100
        
        logger.info(f"Successfully processed job {job_id} with {len(text_chunks)} chunks")
        
    except Exception as e:
        logger.error(f"Processing error for job {job_id}: {str(e)}")
        if job_id in jobs:
            jobs[job_id]['status'] = 'failed'
            jobs[job_id]['error'] = str(e)

def precompute_disease_embeddings():
    """Pre-compute embeddings for all diseases"""
    global disease_embeddings, disease_categories
    
    for disease in DISEASES:
        # Generate enhanced embedding using multiple queries
        enhanced_embedding = embedding_generator.generate_enhanced_embedding(
            disease['label'], 
            disease['category']
        )
        disease_embeddings[disease['value']] = enhanced_embedding
        disease_categories[disease['value']] = disease['category']

@app.route('/api/analysis/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get processing status for a job"""
    job = jobs.get(job_id)
    
    if not job:
        return jsonify({'success': False, 'error': 'Job not found'}), 404
    
    return jsonify({
        'success': True,
        'status': job['status'],
        'progress': job['progress'],
        'error': job.get('error', None)
    })

@app.route('/api/analysis/extract', methods=['POST'])
def extract_clauses():
    """Extract relevant clauses based on disease"""
    try:
        data = request.json
        disease = data.get('disease', '')
        n_results = data.get('n_results', 15)
        
        if not disease:
            return jsonify({'success': False, 'error': 'Disease is required'}), 400
        
        # Get disease details from the list
        disease_info = next((d for d in DISEASES if d['value'] == disease), None)
        if not disease_info:
            return jsonify({'success': False, 'error': 'Disease not found'}), 404
        
        disease_name = disease_info['label']
        disease_category = disease_info['category']
        
        # Generate enhanced embedding for the disease
        disease_embedding = embedding_generator.generate_enhanced_embedding(
            disease_name, 
            disease_category
        )
        
        # Search for similar clauses
        similar_docs = vector_store.search_similar(
            query_embedding=disease_embedding,
            n_results=n_results * 2  # Get more for filtering
        )
        
        # Process and analyze clauses
        clauses = []
        for i, doc in enumerate(similar_docs):
            # Analyze clause with disease-specific context
            analysis = clause_analyzer.analyze_disease_specific_clause(
                doc['text'], 
                disease_name
            )
            
            # Calculate relevance score with disease mention boost
            text_lower = doc['text'].lower()
            disease_lower = disease_name.lower()
            
            # Boost score if disease is explicitly mentioned
            relevance_boost = 0.15 if disease_lower in text_lower else 0
            final_score = min(doc['score'] + relevance_boost, 1.0)
            
            clause = {
                'id': f"clause_{i+1}",
                'text': doc['text'],
                'category': analysis['category'],
                'page': doc.get('page', 1),
                'similarity_score': final_score,
                'cds': analysis.get('cds', 85),
                'erg': analysis.get('erg', 15),
                'pai': analysis.get('pai', 2.5),
                'disease_mentioned': analysis.get('disease_mentioned', False)
            }
            clauses.append(clause)
        
        # Sort by similarity score and take top results
        clauses.sort(key=lambda x: x['similarity_score'], reverse=True)
        clauses = clauses[:n_results]
        
        # Generate the queries that were used
        queries_used = embedding_generator.generate_disease_queries(
            disease_name, 
            disease_category
        )
        
        return jsonify({
            'success': True,
            'clauses': clauses,
            'disease': disease_name,
            'disease_category': disease_category,
            'queries_used': queries_used[:5],  # Return top 5 queries for display
            'total_clauses_found': len(clauses)
        })
        
    except Exception as e:
        logger.error(f"Extraction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analysis/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analysis/clear', methods=['POST'])
def clear_all_documents():
    """Manually clear all documents from vector store"""
    try:
        vector_store.clear_all_documents()
        return jsonify({
            'success': True,
            'message': 'All documents cleared successfully'
        })
    except Exception as e:
        logger.error(f"Clear error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
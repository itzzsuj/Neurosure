import os
from pathlib import Path
import sys
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


project_root = str(Path(__file__).parent.parent)  # Goes up to Neurosure folder
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from layers.cds_calculator import CDSCalculator
from layers.erg_calculator import ERGCalculator
from utils.pdf_processor import PDFProcessor
from routes.brs import brs_bp
from utils.embeddings import EmbeddingGenerator
from utils.vector_store import VectorStore
from utils.clause_analyzer import ClauseAnalyzer
from models.schema import AnalysisJob, Clause, Disease
from layers.pai_calculator import PAICalculator
from models.schema import PatientProfile, ClaimEvaluationRequest
from utils.decision_engine import DecisionEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

cds_calculator = CDSCalculator()
erg_calculator = ERGCalculator()
pai_calculator = PAICalculator()

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
    """Extract relevant clauses based on disease and calculate CDS + ERG + PAI scores"""
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
        
        # Capture CDS score AND report
        cds_score, cds_report = cds_calculator.calculate_from_retrieved_clauses(
            retrieved_clauses=clauses,
            disease_name=disease_name,
            return_report=True
        )
        
        # Capture ERG score AND report
        erg_score, erg_report = erg_calculator.calculate_from_retrieved_clauses(
            retrieved_clauses=clauses,
            disease_name=disease_name,
            return_report=True
        )
        
        # Capture PAI score AND report
        pai_score, pai_report = pai_calculator.calculate_from_retrieved_clauses(
            retrieved_clauses=clauses,
            disease_name=disease_name,
            clause_embeddings=None,
            return_report=True
        )
        
        # Combine all reports into one detailed report
        detailed_report = f"{cds_report}\n\n{erg_report}\n\n{pai_report}"
        
        return jsonify({
            'success': True,
            'clauses': clauses,
            'disease': disease_name,
            'cds_score': cds_score,
            'erg_score': erg_score,
            'pai_score': pai_score,
            'disease_category': disease_category,
            'queries_used': queries_used[:5],
            'total_clauses_found': len(clauses),
            'detailed_report': detailed_report
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
    
# Initialize decision engine (add after other initializations)
decision_engine = DecisionEngine(clause_analyzer)

@app.route('/api/analysis/evaluate-claim', methods=['POST'])
def evaluate_claim():
    """
    Evaluate a claim based on patient profile and policy
    """
    try:
        data = request.json
        patient_data = data.get('patient', {})
        disease = data.get('disease', '')
        
        if not patient_data:
            return jsonify({'success': False, 'error': 'Patient data required'}), 400
        
        # Create patient profile
        patient = PatientProfile(
            age=patient_data.get('age', 0),
            pre_existing_conditions=patient_data.get('pre_existing_conditions', []),
            enrollment_date=patient_data.get('enrollment_date', ''),
            application_date=patient_data.get('application_date', '')
        )
        
        # Get disease info
        disease_info = next((d for d in DISEASES if d['value'] == disease), None)
        if not disease_info:
            disease_info = {'label': disease, 'category': 'General'}
        
        disease_name = disease_info['label']
        
        # Generate disease embedding
        disease_embedding = embedding_generator.generate_enhanced_embedding(
            disease_name,
            disease_info.get('category', 'General')
        )
        
        # Search for relevant clauses
        similar_docs = vector_store.search_similar(
            query_embedding=disease_embedding,
            n_results=30  # Get more clauses for better coverage
        )
        
        # Format clauses
        clauses = []
        for i, doc in enumerate(similar_docs):
            clause = {
                'id': f"clause_{i+1}",
                'text': doc['text'],
                'page': doc.get('page', 1),
                'similarity_score': doc['score']
            }
            clauses.append(clause)
        
        # Evaluate claim using decision engine
        result = decision_engine.evaluate_claim(
            patient=patient,
            clauses=clauses,
            disease_name=disease_name
        )
        
        # Calculate scores using the alignments from the result
        if result.get('success') and 'alignment' in result:
            alignments = result['alignment'].get('alignments', [])
            
            # Calculate CDS score using alignments
            cds_score, cds_report = cds_calculator.calculate_from_retrieved_clauses(
                retrieved_clauses=alignments,
                disease_name=disease_name,
                return_report=True
            )
            
            # Calculate ERG score using alignments
            erg_score, erg_report = erg_calculator.calculate_from_retrieved_clauses(
                retrieved_clauses=alignments,
                disease_name=disease_name,
                return_report=True
            )
            
            # Calculate PAI score using alignments
            pai_score, pai_report = pai_calculator.calculate_from_retrieved_clauses(
                retrieved_clauses=alignments,
                disease_name=disease_name,
                clause_embeddings=None,
                return_report=True
            )
            
            # Add scores to result
            result['cds_score'] = cds_score
            result['erg_score'] = erg_score
            result['pai_score'] = pai_score
            result['detailed_report'] = f"{cds_report}\n\n{erg_report}\n\n{pai_report}"
            
            # Also add to summary
            if 'summary' not in result:
                result['summary'] = {}
            result['summary']['cds'] = cds_score
            result['summary']['erg'] = erg_score
            result['summary']['pai'] = pai_score
        
        # Also add decision info at top level for easier access
        if 'summary' in result:
            result['decision'] = result['summary']['decision']
            result['reason'] = result['summary']['reason']
            result['confidence'] = result['summary']['confidence']
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Claim evaluation error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Add endpoint to get claim history
@app.route('/api/analysis/claim-history', methods=['GET'])
def get_claim_history():
    """Get history of claim evaluations (placeholder)"""
    return jsonify({
        'success': True,
        'history': []
    })

# Add endpoint for policy comparison
@app.route('/api/analysis/compare-policies', methods=['POST'])
def compare_policies():
    """Compare multiple policies (placeholder)"""
    return jsonify({
        'success': True,
        'comparison': {}
    })

app.register_blueprint(brs_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
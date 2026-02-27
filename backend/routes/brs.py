from flask import Blueprint, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os
import logging
import glob
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🚀 BRS Blueprint is being initialized...")

# Define the blueprint FIRST
brs_bp = Blueprint('brs', __name__)

logger.info(f"✅ BRS Blueprint created: {brs_bp.name}")

# Compatibility fix for numpy versions
import numpy
if not hasattr(numpy, '_core'):
    numpy._core = numpy.core
    numpy._core.multiarray = numpy.core.multiarray

# ============================================================
# HELPER FUNCTIONS MUST BE DEFINED FIRST
# ============================================================

def convert_to_serializable(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_to_serializable(item) for item in obj)
    else:
        return obj


def adjust_brs_for_health_insurance(brs_class, brs_score, confidence, features_dict):
    """
    Adjust the motor-insurance trained BRS scores to be more realistic for health insurance
    """
    total_claims = features_dict.get('total_claims', 0)
    approval_rate = features_dict.get('approval_rate', 1.0)
    rejection_rate = features_dict.get('rejection_rate', 0.0)
    emergency_ratio = features_dict.get('emergency_ratio', 0.0)
    hospitalization_ratio = features_dict.get('hospitalization_ratio', 0.0)
    routine_ratio = features_dict.get('routine_ratio', 0.0)
    age = features_dict.get('age', 50)
    
    logger.info(f"🩺 Health Insurance Adjustment - Input: {brs_class} ({brs_score})")
    
    # ============================================================
    # RULE 1: New patients with no claims
    # ============================================================
    if total_claims == 0:
        # No claims yet - they're an unknown quantity
        # In health insurance, new patients are MEDIUM risk, not HIGH
        adjusted_class = 'Medium'
        adjusted_score = 0.55
        reason = "New patient (no claims) - default to Medium risk"
    
    # ============================================================
    # RULE 2: Patients with rejected claims
    # ============================================================
    elif rejection_rate > 0:
        if rejection_rate > 0.5:
            # More than 50% rejections - definitely LOW reliability
            adjusted_class = 'Low'
            adjusted_score = 0.25 + (confidence * 0.1)  # 0.25-0.35
            reason = f"High rejection rate ({rejection_rate:.0%}) → Low reliability"
        elif rejection_rate > 0.2:
            # 20-50% rejections - Medium-Low
            adjusted_class = 'Medium'
            adjusted_score = 0.4 + (confidence * 0.15)  # 0.4-0.55
            reason = f"Moderate rejection rate ({rejection_rate:.0%}) → Medium-Low reliability"
        else:
            # Less than 20% rejections - still Medium (not High)
            adjusted_class = 'Medium'
            adjusted_score = 0.55 + (confidence * 0.1)  # 0.55-0.65
            reason = f"Low rejection rate ({rejection_rate:.0%}) → Medium reliability"
    
    # ============================================================
    # RULE 3: Emergency claim patterns
    # ============================================================
    elif emergency_ratio > 0.3:
        # High emergency rate - indicates potential over-utilization
        if emergency_ratio > 0.6:
            adjusted_class = 'Low'
            adjusted_score = 0.3
            reason = f"Very high emergency rate ({emergency_ratio:.0%}) → Low reliability"
        else:
            adjusted_class = 'Medium'
            adjusted_score = 0.45
            reason = f"High emergency rate ({emergency_ratio:.0%}) → Medium-Low reliability"
    
    # ============================================================
    # RULE 4: Hospitalization patterns
    # ============================================================
    elif hospitalization_ratio > 0.5:
        # Mostly hospitalizations - could be legitimate chronic conditions
        # But also could be high-cost risk
        adjusted_class = 'Medium'
        adjusted_score = 0.5
        reason = "High hospitalization rate → Medium risk"
    
    # ============================================================
    # RULE 5: Routine care patterns (GOOD behavior)
    # ============================================================
    elif routine_ratio > 0.7 and approval_rate > 0.9:
        # Mostly routine care with high approval - this is GOOD
        adjusted_class = 'High'
        adjusted_score = 0.8 + (confidence * 0.1)  # 0.8-0.9
        reason = "Consistent routine care with high approval → High reliability"
    
    # ============================================================
    # RULE 6: Age-based adjustments
    # ============================================================
    else:
        # Base adjustment on age (older patients naturally have more claims)
        if age > 65:
            # Elderly patients - higher base risk
            if brs_class == 'High':
                adjusted_class = 'Medium'
                adjusted_score = 0.6
                reason = "Elderly patient (>65) - downgraded to Medium"
            else:
                adjusted_class = brs_class
                adjusted_score = brs_score * 0.9  # Slight penalty
                reason = f"Elderly patient adjustment"
        elif age < 30:
            # Young patients - lower base risk
            if brs_class == 'Low':
                adjusted_class = 'Medium'
                adjusted_score = 0.5
                reason = "Young patient (<30) - upgraded to Medium"
            else:
                adjusted_class = brs_class
                adjusted_score = brs_score
                reason = "Young patient - no adjustment"
        else:
            # Default to model prediction but with health insurance scaling
            if brs_class == 'High':
                # Even High needs to be justified
                if total_claims == 0:
                    adjusted_class = 'Medium'
                    adjusted_score = 0.55
                    reason = "No claims history - default to Medium"
                else:
                    adjusted_class = 'High'
                    adjusted_score = 0.75 + (approval_rate * 0.15)  # 0.75-0.9
                    reason = "Good history but health-scaled"
            else:
                adjusted_class = brs_class
                adjusted_score = brs_score
                reason = "No adjustment needed"
    
    # Ensure score is within bounds
    adjusted_score = max(0.1, min(0.95, adjusted_score))
    adjusted_score = round(adjusted_score, 2)
    
    logger.info(f"🩺 Health Insurance Adjustment - Output: {adjusted_class} ({adjusted_score}) - {reason}")
    
    return adjusted_class, adjusted_score, reason


def extract_brs_features(claims, patient):
    """
    Extract all 26 features from claim history
    """
    total_claims = len(claims)
    
    # Default values
    approval_rate = 1.0
    rejection_rate = 0.0
    approval_sq = 1.0
    rejection_sq = 0.0
    avg_amount = 0.0
    median_amount = 0.0
    max_amount = 0.0
    min_amount = 0.0
    std_amount = 0.0
    total_amount = 0.0
    log_avg = 0.0
    log_total = 0.0
    log_max = 0.0
    cv_amount = 0.0
    max_min_ratio = 1.0
    emergency_ratio = 0.0
    routine_ratio = 0.0
    hospitalization_ratio = 0.0
    claim_frequency = 0.0
    risk_score = 0.0
    reliability_score = 1.0
    approval_x_routine = 1.0
    rejection_x_emergency = 0.0
    
    if total_claims > 0:
        # Approval metrics
        approved = sum(1 for c in claims if c.get('approved', False))
        approval_rate = approved / total_claims
        rejection_rate = 1 - approval_rate
        approval_sq = approval_rate ** 2
        rejection_sq = rejection_rate ** 2
        
        # Amount metrics
        amounts = [c.get('amount', 0) for c in claims if c.get('amount')]
        if amounts:
            avg_amount = float(np.mean(amounts))
            median_amount = float(np.median(amounts))
            max_amount = float(np.max(amounts))
            min_amount = float(np.min(amounts))
            std_amount = float(np.std(amounts))
            total_amount = float(np.sum(amounts))
            
            # Log transformations
            log_avg = float(np.log1p(avg_amount))
            log_total = float(np.log1p(total_amount))
            log_max = float(np.log1p(max_amount))
            
            # Variability metrics
            cv_amount = float(std_amount / (avg_amount + 1e-6))
            max_min_ratio = float(max_amount / (min_amount + 1e-6))
        
        # Claim type ratios
        claim_types = [c.get('claimType', '').lower() for c in claims]
        emergency_count = sum(1 for t in claim_types if 'emergency' in t)
        routine_count = sum(1 for t in claim_types if 'routine' in t)
        hospitalization_count = sum(1 for t in claim_types if 'hospital' in t)
        
        emergency_ratio = emergency_count / total_claims
        routine_ratio = routine_count / total_claims
        hospitalization_ratio = hospitalization_count / total_claims
        
        # Frequency (claims per year - assuming 3 year window)
        claim_frequency = total_claims / 3
        
        # Composite scores
        risk_score = rejection_rate * emergency_ratio * (1 + cv_amount)
        reliability_score = approval_rate * routine_ratio * (1 - cv_amount/2)
        
        # Interaction terms
        approval_x_routine = approval_rate * routine_ratio
        rejection_x_emergency = rejection_rate * emergency_ratio
    
    # Age and gender from patient data
    age = patient.get('age', 50)
    gender = 1 if patient.get('gender', 'M').upper() == 'F' else 0
    
    # Return all 26 features as a dictionary
    return {
        'total_claims': total_claims,
        'approval_rate': approval_rate,
        'rejection_rate': rejection_rate,
        'approval_sq': approval_sq,
        'rejection_sq': rejection_sq,
        'avg_amount': avg_amount,
        'median_amount': median_amount,
        'max_amount': max_amount,
        'min_amount': min_amount,
        'std_amount': std_amount,
        'total_amount': total_amount,
        'log_avg': log_avg,
        'log_total': log_total,
        'log_max': log_max,
        'cv_amount': cv_amount,
        'max_min_ratio': max_min_ratio,
        'emergency_ratio': emergency_ratio,
        'routine_ratio': routine_ratio,
        'hospitalization_ratio': hospitalization_ratio,
        'claim_frequency': claim_frequency,
        'risk_score': risk_score,
        'reliability_score': reliability_score,
        'approval_x_routine': approval_x_routine,
        'rejection_x_emergency': rejection_x_emergency,
        'age': age,
        'gender': gender
    }


def get_feature_importance(model, feature_names, top_n=6):
    """
    Get top N feature importances from the model
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        
        # Create list of (name, importance) pairs
        feature_imp = list(zip(feature_names, importances))
        
        # Sort by importance descending
        feature_imp.sort(key=lambda x: x[1], reverse=True)
        
        # Take top N
        top_features = feature_imp[:top_n]
        
        # Convert to dictionary with formatted names
        result = {}
        for name, imp in top_features:
            # Format feature name for display
            display_name = name.replace('_', ' ').title()
            result[display_name] = float(imp)
        
        return result
    else:
        # Fallback if model doesn't have feature_importances_
        return {
            'Approval Rate': 0.24,
            'Rejection Rate': 0.17,
            'Emergency Ratio': 0.11,
            'Total Claims': 0.08,
            'Avg Amount': 0.05,
            'Claim Frequency': 0.04
        }


def calculate_claim_stats(claims):
    """
    Calculate summary statistics for claims
    """
    total = len(claims)
    
    if total == 0:
        return {
            'total': 0,
            'approved': 0,
            'approvalRate': 100,
            'emergencyCount': 0,
            'emergencyRatio': 0,
            'totalAmount': 0,
            'avgAmount': 0
        }
    
    approved = sum(1 for c in claims if c.get('approved', False))
    approval_rate = (approved / total) * 100
    
    emergency_count = sum(1 for c in claims if c.get('claimType', '').lower() == 'emergency')
    emergency_ratio = (emergency_count / total) * 100
    
    total_amount = sum(c.get('amount', 0) for c in claims)
    avg_amount = total_amount / total
    
    return {
        'total': total,
        'approved': approved,
        'approvalRate': round(approval_rate),
        'emergencyCount': emergency_count,
        'emergencyRatio': round(emergency_ratio),
        'totalAmount': float(total_amount),
        'avgAmount': float(round(avg_amount))
    }


# ============================================================
# LOAD MODEL (after helper functions)
# ============================================================

# Path to your model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'layers', 'bds', 'brs_final_model_20260227_130542.pkl')
logger.info(f"📁 Looking for model at: {MODEL_PATH}")

# Load model at startup
try:
    if os.path.exists(MODEL_PATH):
        logger.info(f"📁 Loading BRS model from: {MODEL_PATH}")
        model_data = joblib.load(MODEL_PATH)
        model = model_data['model']
        feature_names = model_data.get('feature_names', [])
        scaler = model_data.get('scaler')
        label_encoder = model_data.get('label_encoder')
        model_accuracy = model_data.get('accuracy', 0.908)
        logger.info(f"✅ BRS Model loaded with {len(feature_names)} features, accuracy: {model_accuracy:.3f}")
        
        # Debug model classes
        if hasattr(model, 'classes_'):
            logger.info(f"📊 Model classes: {model.classes_}")
    else:
        logger.error(f"❌ Model file not found at: {MODEL_PATH}")
        model = None
        feature_names = []
        scaler = None
        label_encoder = None
        model_accuracy = 0.908
except Exception as e:
    logger.error(f"❌ Failed to load BRS model: {e}")
    model = None
    feature_names = []
    scaler = None
    label_encoder = None
    model_accuracy = 0.908


# ============================================================
# ROUTES (after all functions and model are loaded)
# ============================================================

@brs_bp.route('/api/brs/predict', methods=['POST'])
def predict_brs():
    """
    Predict BRS score for a patient based on their claim history
    """
    try:
        data = request.json
        claims = data.get('claims', [])
        patient = data.get('patient', {})
        
        if model is None:
            return jsonify({
                'success': False, 
                'error': 'BRS model not loaded'
            }), 500
        
        # Extract features from claims
        features_dict = extract_brs_features(claims, patient)
        
        # Log features for debugging
        logger.info(f"📊 Extracted features: {features_dict}")
        
        # Create feature vector in the correct order
        feature_vector = []
        for feature_name in feature_names:
            if feature_name in features_dict:
                feature_vector.append(features_dict[feature_name])
            else:
                # Default value if feature missing
                feature_vector.append(0.0)
                logger.warning(f"Missing feature: {feature_name}")
        
        # Convert to numpy array and reshape
        X = np.array(feature_vector).reshape(1, -1)
        
        # Scale features if scaler exists
        if scaler:
            X_scaled = scaler.transform(X)
        else:
            X_scaled = X
        
        # Predict class and probabilities
        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]
        
        # Get class label
        if label_encoder:
            brs_class = label_encoder.inverse_transform([prediction])[0]
        else:
            # Fallback mapping
            class_map = {0: 'Low', 1: 'Medium', 2: 'High'}
            brs_class = class_map.get(prediction, 'Medium')
        
        # Get confidence (max probability)
        confidence = float(np.max(probabilities))
        
        # Log raw prediction details
        logger.info(f"🎯 Raw model prediction class index: {prediction}")
        logger.info(f"📊 Raw probabilities: {probabilities}")
        logger.info(f"🏷️ Raw predicted class: {brs_class}")
        logger.info(f"📈 Raw confidence: {confidence}")
        
        # Map class to raw score
        if brs_class == 'High':
            raw_score = 0.7 + (confidence * 0.25)  # 0.7-0.95
        elif brs_class == 'Medium':
            raw_score = 0.4 + (confidence * 0.3)   # 0.4-0.7
        else:  # Low
            raw_score = 0.1 + (confidence * 0.25)  # 0.1-0.35
        
        raw_score = round(raw_score, 2)
        
        # ============================================================
        # APPLY HEALTH INSURANCE ADJUSTMENTS
        # ============================================================
        adjusted_class, adjusted_score, adjustment_reason = adjust_brs_for_health_insurance(
            brs_class, raw_score, confidence, features_dict
        )
        
        # Calculate feature importance for this prediction
        feature_importance = get_feature_importance(model, feature_names)
        
        # Calculate claim statistics for display
        claim_stats = calculate_claim_stats(claims)
        
        # Prepare response with converted types
        response = {
            'success': True,
            'brs_score': convert_to_serializable(adjusted_score),
            'brs_class': convert_to_serializable(adjusted_class),
            'raw_model_class': convert_to_serializable(brs_class),
            'raw_model_score': convert_to_serializable(raw_score),
            'confidence': convert_to_serializable(confidence),
            'model_accuracy': convert_to_serializable(model_accuracy),
            'feature_importance': convert_to_serializable(feature_importance),
            'claim_stats': convert_to_serializable(claim_stats),
            'total_features': len(feature_names),
            'adjustment_reason': adjustment_reason
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"BRS prediction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@brs_bp.route('/api/brs/model-info', methods=['GET'])
def model_info():
    """Get information about the loaded BRS model"""
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'success': True,
        'features': convert_to_serializable(feature_names),
        'feature_count': len(feature_names),
        'accuracy': float(model_accuracy),
        'model_type': type(model).__name__
    })
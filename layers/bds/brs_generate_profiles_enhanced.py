# brs_generate_complete_with_validation.py
import subprocess
import json
import time
import re
from datetime import datetime
import os
import sys
import random
import numpy as np
from collections import Counter

print("="*80)
print("🚀 GENERATING ENHANCED PROFILES WITH MTPL VALIDATION")
print("="*80)

# ===============================
# STEP 1: LOAD MTPL PATTERNS FOR VALIDATION
# ===============================
print("\n📊 Loading MTPL patterns for validation...")
try:
    with open('mtpl_patterns.json', 'r') as f:
        patterns = json.load(f)
    print(f"✅ Loaded MTPL patterns:")
    print(f"   - BonusMalus Mean: {patterns['bonusmalus']['mean']}")
    print(f"   - BonusMalus Std: {patterns['bonusmalus']['std']}")
    print(f"   - Claim Amount Mean: ${patterns['claim_amounts']['mean']:,.2f}")
except FileNotFoundError:
    print("❌ mtpl_patterns.json not found! Run extract_patterns.py first")
    sys.exit(1)

# ===============================
# DISEASE OPTIONS
# ===============================
DISEASE_OPTIONS = [
    "Diabetes Type 2", "Hypertension", "Coronary Artery Disease",
    "COPD", "Asthma", "Rheumatoid Arthritis", "Osteoarthritis",
    "Chronic Kidney Disease", "Breast Cancer", "Lung Cancer",
    "Prostate Cancer", "Alzheimer's Disease", "Parkinson's Disease",
    "Multiple Sclerosis", "Major Depression", "Anxiety Disorder",
    "Bipolar Disorder", "Crohn's Disease", "Ulcerative Colitis",
    "Hepatitis C", "HIV/AIDS", "Thyroid Disorders", "Sleep Apnea",
    "Chronic Migraine"
]

# ===============================
# ENHANCED FEATURE SETS
# ===============================
HOSPITAL_TIERS = ["tier1_government", "tier2_private", "tier3_premium"]
LOCATIONS = ["urban_metro", "urban_small", "suburban", "rural_town", "rural_village"]
INCOME_LEVELS = ["low", "middle_low", "middle", "middle_high", "high"]
EDUCATION_LEVELS = ["high_school", "bachelors", "masters", "phd", "professional"]
EMPLOYMENT_STATUS = ["employed_full", "employed_part", "self_employed", "unemployed", "retired", "student"]
CLAIM_TYPES = ["hospitalization", "outpatient", "emergency", "surgery", "diagnostic", "medication", "therapy", "specialist"]
SEVERITIES = ["mild", "moderate", "severe", "critical"]
GENDERS = ["M", "F", "other"]

# ===============================
# CONFIGURATION
# ===============================
TOTAL_PROFILES = 1000
all_profiles = []
failed_batches = []
start_time = time.time()

# Test Ollama connection
print("\n🔍 Testing Ollama connection...")
try:
    test_response = subprocess.run(
        ['ollama', 'list'], 
        capture_output=True, 
        text=True,
        encoding='utf-8'
    )
    if test_response.returncode != 0:
        print("❌ Ollama is not running!")
        print("   Run 'ollama serve' in another terminal")
        sys.exit(1)
    print("✅ Ollama is running")
except FileNotFoundError:
    print("❌ Ollama not found! Please install Ollama first")
    sys.exit(1)

def generate_profile_with_mtpl_validation(profile_num):
    """Generate profile and validate against MTPL patterns"""
    
    condition = random.choice(DISEASE_OPTIONS)
    
    # ===============================
    # USE MTPL PATTERNS TO GUIDE GENERATION
    # ===============================
    # Generate BonusMalus from REAL distribution
    target_bonusmalus = np.random.normal(
        patterns['bonusmalus']['mean'],
        patterns['bonusmalus']['std']
    )
    target_bonusmalus = max(50, min(230, target_bonusmalus))
    
    # Map to reliability
    if target_bonusmalus < 70:
        reliability = "high"
        expected_brs = random.uniform(0.8, 0.95)
        claim_prob = 0.1
    elif target_bonusmalus < 100:
        reliability = "medium_high"
        expected_brs = random.uniform(0.65, 0.8)
        claim_prob = 0.2
    elif target_bonusmalus < 130:
        reliability = "medium"
        expected_brs = random.uniform(0.5, 0.65)
        claim_prob = 0.3
    elif target_bonusmalus < 200:
        reliability = "medium_low"
        expected_brs = random.uniform(0.35, 0.5)
        claim_prob = 0.4
    else:
        reliability = "low"
        expected_brs = random.uniform(0.2, 0.35)
        claim_prob = 0.6
    
    # Create prompt with MTPL context
    prompt = f"""You are an insurance actuary creating a synthetic health insurance patient profile.
Base your generation on these REAL insurance patterns from French MTPL data:

SOURCE PATTERNS FOR VALIDATION:
- BonusMalus (reliability score) should average {patterns['bonusmalus']['mean']:.1f}
- Claim amounts average ${patterns['claim_amounts']['mean']:,.2f}
- Claim frequency: most people have 0-1 claims, few have 2+

TARGET RELIABILITY FOR THIS PROFILE:
- Target BonusMalus equivalent: {target_bonusmalus:.1f}
- Reliability class: {reliability}
- Expected BRS range: {expected_brs-0.1:.2f}-{expected_brs+0.1:.2f}
- Claim probability: {claim_prob*100:.0f}% per year

Generate ONE comprehensive patient profile with these specifications:
- Age: between 25-85 years
- Gender: {random.choice(GENDERS)}
- Medical Condition: {condition}
- Severity: {random.choice(SEVERITIES)}
- Location: {random.choice(LOCATIONS)}
- Hospital tier: {random.choice(HOSPITAL_TIERS)}
- Income: {random.choice(INCOME_LEVELS)}
- Education: {random.choice(EDUCATION_LEVELS)}
- Employment: {random.choice(EMPLOYMENT_STATUS)}

Return a valid JSON object with this structure:
{{
    "patient_id": "P{profile_num:04d}",
    "validation_metadata": {{
        "target_bonusmalus": {target_bonusmalus:.1f},
        "reliability_class": "{reliability}",
        "source_pattern": "French MTPL"
    }},
    "demographics": {{
        "age": integer,
        "gender": "string",
        "location": "string",
        "income_level": "string",
        "education": "string",
        "employment": "string",
        "has_insurance": boolean
    }},
    "medical": {{
        "primary_condition": "string",
        "severity": "string",
        "diagnosis_year": integer,
        "complications": ["string"],
        "secondary_conditions": ["string"]
    }},
    "healthcare_access": {{
        "preferred_hospital_tier": "string",
        "distance_to_hospital_km": float,
        "regular_physician": boolean
    }},
    "behavioral_metrics": {{
        "treatment_adherence": float,
        "appointment_consistency": float,
        "medication_compliance": float,
        "emergency_room_tendency": float
    }},
    "claim_history": [
        {{
            "date": "YYYY-MM-DD",
            "claim_type": "string",
            "amount": float,
            "hospital_tier": "string",
            "diagnosis": "string",
            "approved": boolean
        }}
    ],
    "summary_statistics": {{
        "total_claims_5years": integer,
        "total_claim_amount": float,
        "approval_rate": float,
        "emergency_visit_rate": float
    }},
    "target_brs": float
}}

Generate 3-5 years of realistic claim history. Return ONLY the JSON object."""

    max_retries = 3
    success = False

    for attempt in range(max_retries):
        try:
            print(f"\n  🤔 Generating profile {profile_num} (attempt {attempt+1}/{max_retries})...")
            
            result = subprocess.run(
                ['ollama', 'run', 'llama3.2', prompt],
                capture_output=True,
                timeout=120
            )
            
            stdout = result.stdout.decode('utf-8', errors='ignore')
            
            # Try to extract JSON with better regex
            json_match = re.search(r'(\{.*\})', stdout, re.DOTALL)
            if not json_match:
                print(f"  ⚠️  No JSON found, retrying...")
                continue
            
            try:
                profile = json.loads(json_match.group(1))
                
                # Validate required fields
                required = ['patient_id', 'target_brs', 'demographics', 'medical', 'claim_history']
                if all(k in profile for k in required):
                    print(f"  ✅ Profile {profile_num} generated successfully")
                    success = True
                    break
                else:
                    print(f"  ⚠️  Missing fields, retrying...")
                    continue
                    
            except json.JSONDecodeError as e:
                print(f"  ⚠️  JSON error: {e}, retrying...")
                continue
                
        except subprocess.TimeoutExpired:
            print(f"  ⚠️  Timeout, retrying...")
            continue
        except Exception as e:
            print(f"  ⚠️  Error: {e}, retrying...")
            continue

    if not success:
        print(f"  ❌ Failed after {max_retries} attempts")
        return None
    
    # At the VERY END of the prompt string, add:
    prompt += "\n\nReturn ONLY valid JSON. No explanations, no markdown, no comments. Just the JSON object."
    
    # ===============================
    # VALIDATE AGAINST MTPL PATTERNS
    # ===============================
    validation_results = {
        "bonusmalus_target": target_bonusmalus,
        "bonusmalus_match": None,
        "claim_amount_match": None,
        "overall_validation": False
    }
    
    # Check if generated BRS matches expected range
    if 'target_brs' in profile:
        brs = profile['target_brs']
        expected_min = expected_brs - 0.15
        expected_max = expected_brs + 0.15
        validation_results['brs_in_range'] = expected_min <= brs <= expected_max
        validation_results['brs_target'] = expected_brs
        validation_results['brs_generated'] = brs
    
    # Check claim amounts against MTPL distribution
    if 'claim_history' in profile and profile['claim_history']:
        amounts = [c.get('amount', 0) for c in profile['claim_history']]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        mtpl_mean = patterns['claim_amounts']['mean']
        validation_results['claim_amount_match'] = abs(avg_amount - mtpl_mean) / mtpl_mean < 0.5
    
    profile['validation'] = validation_results
    
    print(f"  ✅ Profile {profile_num} generated and validated")
    return profile

# ===============================
# GENERATE PROFILES - OPTIMIZED VERSION
# ===============================
import concurrent.futures

BATCH_SIZE = 5
MAX_WORKERS = 3

print(f"\n🎯 Generating {TOTAL_PROFILES} profiles with MTPL validation...")
print(f"   Batch size: {BATCH_SIZE}, Parallel workers: {MAX_WORKERS}")
print("="*80)

def generate_batch(start_num, batch_size):
    """Generate a batch of profiles"""
    batch_profiles = []
    for i in range(batch_size):
        profile_num = start_num + i
        if profile_num <= TOTAL_PROFILES:
            profile = generate_profile_with_mtpl_validation(profile_num)
            if profile:
                batch_profiles.append(profile)
    return batch_profiles

# Create batch starts
batch_starts = list(range(1, TOTAL_PROFILES + 1, BATCH_SIZE))

with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    # Submit all batches
    future_to_batch = {
        executor.submit(generate_batch, start, BATCH_SIZE): start 
        for start in batch_starts
    }
    
    # Process results as they complete
    for future in concurrent.futures.as_completed(future_to_batch):
        start = future_to_batch[future]
        try:
            batch_profiles = future.result()
            all_profiles.extend(batch_profiles)
            
            # Progress update
            elapsed = time.time() - start_time
            rate = len(all_profiles) / (elapsed / 60)
            print(f"\n📊 Progress: {len(all_profiles)}/{TOTAL_PROFILES} profiles")
            print(f"   Speed: {rate:.1f} profiles/minute")
            print(f"   Est remaining: {(TOTAL_PROFILES - len(all_profiles)) / rate:.1f} minutes")
            
        except Exception as e:
            print(f"❌ Batch starting at {start} failed: {e}")
            failed_batches.append(start)

# ===============================
# FINAL VALIDATION AGAINST MTPL
# ===============================
print("\n" + "="*80)
print("📊 FINAL VALIDATION AGAINST MTPL PATTERNS")
print("="*80)

if all_profiles:
    # Extract BRS values
    brs_values = [p.get('target_brs', 0) for p in all_profiles]
    
    # Extract claim amounts
    all_amounts = []
    for p in all_profiles:
        if 'claim_history' in p:
            amounts = [c.get('amount', 0) for c in p['claim_history']]
            all_amounts.extend(amounts)
    
    print(f"\n📈 BRS Distribution vs Expected:")
    print(f"   Generated BRS Mean: {sum(brs_values)/len(brs_values):.3f}")
    print(f"   Expected Range: 0.3-0.95")
    print(f"   ✅ Valid" if 0.3 < sum(brs_values)/len(brs_values) < 0.8 else "   ⚠️ Check")
    
    print(f"\n💰 Claim Amounts vs MTPL:")
    if all_amounts:
        print(f"   Generated Mean: ${sum(all_amounts)/len(all_amounts):,.2f}")
        print(f"   MTPL Mean: ${patterns['claim_amounts']['mean']:,.2f}")
        match_pct = abs(sum(all_amounts)/len(all_amounts) - patterns['claim_amounts']['mean']) / patterns['claim_amounts']['mean'] * 100
        print(f"   Difference: {match_pct:.1f}%")
    
    # Validation score
    validation_score = len([p for p in all_profiles if p.get('validation', {}).get('brs_in_range', False)]) / len(all_profiles) * 100
    print(f"\n✅ Validation Score: {validation_score:.1f}% of profiles match expected BRS range")

# ===============================
# SAVE RESULTS
# ===============================
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f'validated_profiles_{timestamp}.json'

with open(filename, 'w', encoding='utf-8') as f:
    json.dump({
        "metadata": {
            "generation_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_profiles": len(all_profiles),
            "failed": len(failed_batches),
            "validation": {
                "mtpl_source": "French MTPL",
                "bonusmalus_mean": patterns['bonusmalus']['mean'],
                "claim_amount_mean": patterns['claim_amounts']['mean']
            }
        },
        "profiles": all_profiles
    }, f, indent=2)

print(f"\n✅ Saved {len(all_profiles)} validated profiles to {filename}")
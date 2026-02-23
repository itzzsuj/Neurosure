# layers/rl/generate_synthetic_data.py
import json
import random
import numpy as np
import pandas as pd
from pathlib import Path

print("="*60)
print("📊 GENERATING SYNTHETIC DATA FOR RL")
print("="*60)

# ===============================
# LOAD REAL BRS VALUES FROM YOUR PROFILES
# ===============================
brs_file = Path(__file__).parent.parent / "bds" / "brs_balanced_20260222_232728.json"

with open(brs_file, 'r') as f:
    data = json.load(f)

profiles = data['profiles']
real_brs_values = [p.get('target_brs', 0.5) for p in profiles]
print(f"✅ Loaded {len(real_brs_values)} real BRS values from {len(profiles)} profiles")
print(f"   BRS Range: {min(real_brs_values):.2f} - {max(real_brs_values):.2f}")
print(f"   BRS Mean: {sum(real_brs_values)/len(real_brs_values):.2f}")

# ===============================
# GENERATE 10,000 SYNTHETIC STATES
# ===============================
print("\n🔄 Generating 10,000 synthetic states...")

synthetic_states = []

for i in range(10000):
    # Generate realistic CDS, ERG, PAI (0-1 range)
    cds = round(random.uniform(0.1, 0.95), 2)
    erg = round(random.uniform(0.1, 0.95), 2)
    pai = round(random.uniform(0.1, 0.95), 2)
    
    # Pick a random BRS from your real profiles
    brs = round(random.choice(real_brs_values), 2)
    
    # ===== COMPREHENSIVE EDGE CASE COVERAGE =====
    # LEVEL 1: ABSOLUTE RULES
    if erg > 0.8:
        truth = "REJECT"
    elif cds < 0.2:
        truth = "REJECT"
    
    # LEVEL 2: CLEAR CASES
    elif cds > 0.7 and erg < 0.3 and pai < 0.4 and brs > 0.6:
        truth = "APPROVE"
    elif cds > 0.8 and erg < 0.2:
        truth = "APPROVE"
    elif erg > 0.7 and cds < 0.4:
        truth = "REJECT"
    
    # LEVEL 3: AMBIGUITY CASES
    elif pai > 0.8:
        truth = "REVIEW"
    elif pai > 0.7 and (cds > 0.6 and erg > 0.5):
        truth = "REVIEW"
    
    # LEVEL 4: PATIENT RELIABILITY EDGE CASES
    elif brs < 0.2:
        truth = "REJECT"
    elif brs < 0.3 and cds > 0.6:
        truth = "REVIEW"
    elif brs < 0.4 and erg > 0.5:
        truth = "REJECT"
    elif brs > 0.8 and cds > 0.5 and erg < 0.5:
        truth = "APPROVE"
    
    # LEVEL 5: COVERAGE VS RISK BATTLES
    elif cds > 0.7 and erg > 0.6:
        truth = "REVIEW"
    elif cds > 0.6 and erg > 0.6:
        truth = "REVIEW"
    elif cds > 0.6 and erg < 0.4:
        truth = "APPROVE"
    elif cds < 0.4 and erg > 0.5:
        truth = "REJECT"
    
    # LEVEL 6: MODERATE CASES
    else:
        approve_score = cds * 0.4 + brs * 0.3 - erg * 0.2 - pai * 0.1
        if approve_score > 0.3:
            truth = "APPROVE"
        elif approve_score < -0.2:
            truth = "REJECT"
        else:
            truth = "REVIEW"
    
    # Append to list
    synthetic_states.append({
        'cds': cds,
        'erg': erg,
        'pai': pai,
        'brs': brs,
        'true_action': truth  # ← This creates the column
    })

# Convert to DataFrame
df = pd.DataFrame(synthetic_states)
print(f"✅ Generated {len(df)} synthetic samples")

# Show distribution
print("\n📊 Distribution of true actions:")
action_counts = df['true_action'].value_counts()
for action, count in action_counts.items():
    percentage = (count / len(df)) * 100
    print(f"   {action}: {count} ({percentage:.1f}%)")

print(f"\n📊 BRS statistics in synthetic data:")
print(f"   Min: {df['brs'].min():.2f}")
print(f"   Max: {df['brs'].max():.2f}")
print(f"   Mean: {df['brs'].mean():.2f}")

# Save
output_file = Path(__file__).parent / "synthetic_rl_data.csv"
df.to_csv(output_file, index=False)
print(f"\n💾 Saved to: {output_file}")

print("\n✅ Synthetic data generation complete!")
print(f"   • Used {len(real_brs_values)} real BRS values")
print(f"   • Generated 10,000 synthetic combinations")
print(f"   • Each state: [CDS, ERG, PAI, BRS] + ground truth")
# add_low_brs_profiles.py
import json
import random
import numpy as np
from datetime import datetime

print("📊 ADDING LOW BRS PROFILES")
print("="*50)

# Load your fixed file
with open('brs_fixed_20260222_231239.json', 'r') as f:
    data = json.load(f)

profiles = data['profiles']
print(f"✅ Loaded {len(profiles)} profiles")

# Create 20 low BRS profiles by copying and modifying existing ones
low_profiles = []
for i in range(20):
    # Copy a random profile
    base = random.choice(profiles)
    new_profile = json.loads(json.dumps(base))  # Deep copy
    
    # Modify to make it low BRS
    new_profile['target_brs'] = round(random.uniform(0.2, 0.39), 3)
    
    # Adjust claim history to match low reliability
    if 'claim_history' in new_profile:
        # Make more claims, lower approval
        for claim in new_profile['claim_history']:
            claim['approved'] = random.random() < 0.4  # 40% approval
            
    # Update summary stats
    if 'summary_statistics' in new_profile:
        new_profile['summary_statistics']['approval_rate'] = round(random.uniform(0.3, 0.45), 2)
    
    low_profiles.append(new_profile)

# Add to main list
profiles.extend(low_profiles)
print(f"✅ Added {len(low_profiles)} low BRS profiles")

# Shuffle
random.shuffle(profiles)

# New stats
new_brs = [p.get('target_brs', 0) for p in profiles]
print(f"\n📊 New Distribution:")
print(f"   Total: {len(profiles)} profiles")
print(f"   BRS Mean: {np.mean(new_brs):.3f}")
print(f"   BRS Min: {np.min(new_brs):.3f}")
print(f"   BRS Max: {np.max(new_brs):.3f}")

# Save
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f'brs_complete_{timestamp}.json'

data['profiles'] = profiles
data['metadata']['low_brs_added'] = 20
data['metadata']['final_count'] = len(profiles)

with open(filename, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n💾 Saved complete dataset to: {filename}")
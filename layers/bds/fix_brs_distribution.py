# fix_brs_distribution.py
import json
import random
import numpy as np
from collections import Counter
from datetime import datetime
import glob

print("="*60)
print("📊 FIXING BRS DISTRIBUTION WITHOUT REGENERATION")
print("="*60)

# ===============================
# FIND YOUR LATEST PROFILE FILE
# ===============================
print("\n🔍 Looking for your profile files...")
json_files = glob.glob('validated_profiles_*.json')

if not json_files:
    print("❌ No validated_profiles_*.json files found!")
    print("   Looking for any profile files...")
    json_files = glob.glob('*profiles*.json')

if not json_files:
    print("❌ No profile files found!")
    exit(1)

print(f"✅ Found {len(json_files)} files:")
for f in json_files:
    print(f"   - {f}")

# Use the most recent file
latest_file = max(json_files, key=lambda x: x)
print(f"\n📁 Using: {latest_file}")

# ===============================
# LOAD PROFILES
# ===============================
with open(latest_file, 'r') as f:
    data = json.load(f)

# Handle different JSON structures
if isinstance(data, dict) and 'profiles' in data:
    profiles = data['profiles']
elif isinstance(data, list):
    profiles = data
else:
    profiles = data.get('profiles', data)

print(f"✅ Loaded {len(profiles)} profiles")

# Calculate current stats
current_brs = []
for p in profiles:
    if isinstance(p, dict):
        brs = p.get('target_brs') or p.get('brs_calculated') or p.get('BRS')
        if brs:
            current_brs.append(brs)

if current_brs:
    print(f"\n📊 Current BRS Statistics:")
    print(f"   Mean: {np.mean(current_brs):.3f}")
    print(f"   Min: {np.min(current_brs):.3f}")
    print(f"   Max: {np.max(current_brs):.3f}")

# ===============================
# FIX THE DISTRIBUTION
# ===============================
print("\n🔧 Fixing BRS distribution...")

# Separate profiles by BRS
high_brs = []
medium_brs = []
low_brs = []

for profile in profiles:
    if isinstance(profile, dict):
        brs = profile.get('target_brs') or profile.get('brs_calculated') or profile.get('BRS', 0.5)
        if brs > 0.7:
            high_brs.append(profile)
        elif brs < 0.4:
            low_brs.append(profile)
        else:
            medium_brs.append(profile)

print(f"\n📊 Current Distribution:")
print(f"   High BRS (>0.7): {len(high_brs)} profiles")
print(f"   Medium BRS (0.4-0.7): {len(medium_brs)} profiles")
print(f"   Low BRS (<0.4): {len(low_brs)} profiles")

# Create balanced dataset
target_per_group = min(300, len(high_brs), len(medium_brs), len(low_brs))
if target_per_group < 50:
    target_per_group = min(100, len(profiles) // 3)

print(f"\n🎯 Creating balanced dataset with ~{target_per_group} per group")

balanced_profiles = []
balanced_profiles.extend(random.sample(high_brs, min(target_per_group, len(high_brs))))
balanced_profiles.extend(random.sample(medium_brs, min(target_per_group, len(medium_brs))))
balanced_profiles.extend(random.sample(low_brs, min(target_per_group, len(low_brs))))

# Shuffle
random.shuffle(balanced_profiles)

# Calculate new stats
new_brs = []
for p in balanced_profiles:
    brs = p.get('target_brs') or p.get('brs_calculated') or p.get('BRS', 0.5)
    new_brs.append(brs)

print(f"\n✅ New Distribution:")
print(f"   Total: {len(balanced_profiles)} profiles")
print(f"   BRS Mean: {np.mean(new_brs):.3f}")
print(f"   BRS Min: {np.min(new_brs):.3f}")
print(f"   BRS Max: {np.max(new_brs):.3f}")

# ===============================
# SAVE FIXED VERSION
# ===============================
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f'brs_fixed_{timestamp}.json'

output_data = {
    "metadata": {
        "original_file": latest_file,
        "original_count": len(profiles),
        "fixed_count": len(balanced_profiles),
        "brs_mean": float(np.mean(new_brs)),
        "brs_min": float(np.min(new_brs)),
        "brs_max": float(np.max(new_brs)),
        "generation_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "fix_method": "stratified_sampling"
    },
    "profiles": balanced_profiles
}

with open(filename, 'w') as f:
    json.dump(output_data, f, indent=2)

print(f"\n💾 Saved fixed profiles to: {filename}")
print("\n✅ DONE! Use this file for your model.")
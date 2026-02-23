# extract_patterns.py
import pandas as pd
import numpy as np
import json
import os

print("📊 EXTRACTING BEHAVIORAL PATTERNS FROM FRENCH MTPL")
print("="*60)

# Get current directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load the data
print("\n📂 Loading data...")
freq_df = pd.read_csv(os.path.join(script_dir, "freMTPLfreq.csv"))
sev_df = pd.read_csv(os.path.join(script_dir, "freMTPLsev.csv"))

print(f"✅ Frequency data: {len(freq_df):,} policies")
print(f"✅ Severity data: {len(sev_df):,} claims")

# Merge datasets
print("\n🔄 Merging frequency and severity data...")
merged_df = freq_df.merge(sev_df, on='IDpol', how='left')
merged_df['ClaimAmount'] = merged_df['ClaimAmount'].fillna(0)

# Clean column names - remove quotes from string columns
print("\n🧹 Cleaning data...")
for col in merged_df.columns:
    # Check if column is string type
    if merged_df[col].dtype == 'object':
        # Remove quotes if present
        merged_df[col] = merged_df[col].astype(str).str.replace("'", "")
        # Convert numeric strings back to numbers where appropriate
        if col in ['VehPower', 'VehAge', 'DrivAge', 'BonusMalus', 'Density']:
            merged_df[col] = pd.to_numeric(merged_df[col], errors='coerce')

print(f"✅ Merged data: {len(merged_df):,} rows")
print("\n📊 First 5 rows:")
print(merged_df.head())

# ============================================================
# PATTERN 1: Claim Frequency Distribution
# ============================================================
print("\n📈 PATTERN 1: Claim Frequency Distribution")
freq_dist = merged_df['ClaimNb'].value_counts().sort_index()
total_policies = len(merged_df)

freq_patterns = {}
for n_claims, count in freq_dist.items():
    percentage = (count / total_policies) * 100
    freq_patterns[int(n_claims)] = {
        'count': int(count),
        'percentage': round(percentage, 2)
    }
    print(f"   {n_claims} claim(s): {count:,} policies ({percentage:.2f}%)")

# ============================================================
# PATTERN 2: BonusMalus as Reliability Score
# ============================================================
print("\n📊 PATTERN 2: BonusMalus (Reliability Proxy) Statistics")
# Convert BonusMalus to numeric
merged_df['BonusMalus'] = pd.to_numeric(merged_df['BonusMalus'], errors='coerce')

bonusmalus_stats = {
    'min': int(merged_df['BonusMalus'].min()),
    'max': int(merged_df['BonusMalus'].max()),
    'mean': round(merged_df['BonusMalus'].mean(), 2),
    'median': int(merged_df['BonusMalus'].median()),
    'std': round(merged_df['BonusMalus'].std(), 2),
    'percentiles': {
        '25%': int(merged_df['BonusMalus'].quantile(0.25)),
        '50%': int(merged_df['BonusMalus'].quantile(0.50)),
        '75%': int(merged_df['BonusMalus'].quantile(0.75)),
        '90%': int(merged_df['BonusMalus'].quantile(0.90)),
        '95%': int(merged_df['BonusMalus'].quantile(0.95))
    }
}

print(f"   Min: {bonusmalus_stats['min']}")
print(f"   Max: {bonusmalus_stats['max']}")
print(f"   Mean: {bonusmalus_stats['mean']}")
print(f"   Median: {bonusmalus_stats['median']}")
print(f"   Std: {bonusmalus_stats['std']}")
print(f"   90th percentile: {bonusmalus_stats['percentiles']['90%']}")

# ============================================================
# PATTERN 3: Correlation Between BonusMalus and Claims
# ============================================================
print("\n🔄 PATTERN 3: Correlation Analysis")
correlation = merged_df['BonusMalus'].corr(merged_df['ClaimNb'])

print(f"   Pearson correlation: {correlation:.3f}")
print(f"   Interpretation: Higher BonusMalus = {abs(correlation):.1%} more likely to file claims")

# Group by BonusMalus range to show pattern
merged_df['BonusMalus_Range'] = pd.cut(merged_df['BonusMalus'], 
                                        bins=[0, 70, 100, 130, 200, 300],
                                        labels=['Very Low (<70)', 'Low (70-100)', 
                                                'Medium (100-130)', 'High (130-200)', 
                                                'Very High (>200)'])
range_claims = merged_df.groupby('BonusMalus_Range')['ClaimNb'].mean()
print("\n   Average claims by BonusMalus range:")
for range_name, avg_claims in range_claims.items():
    print(f"     {range_name}: {avg_claims:.3f} claims")

# ============================================================
# PATTERN 4: Claim Amount Distribution
# ============================================================
print("\n💰 PATTERN 4: Claim Amount Statistics")
claims_with_amounts = merged_df[merged_df['ClaimAmount'] > 0]
if len(claims_with_amounts) > 0:
    amount_stats = {
        'min': float(claims_with_amounts['ClaimAmount'].min()),
        'max': float(claims_with_amounts['ClaimAmount'].max()),
        'mean': float(claims_with_amounts['ClaimAmount'].mean()),
        'median': float(claims_with_amounts['ClaimAmount'].median()),
        'std': float(claims_with_amounts['ClaimAmount'].std()),
        'percentiles': {
            '25%': float(claims_with_amounts['ClaimAmount'].quantile(0.25)),
            '50%': float(claims_with_amounts['ClaimAmount'].quantile(0.50)),
            '75%': float(claims_with_amounts['ClaimAmount'].quantile(0.75)),
            '90%': float(claims_with_amounts['ClaimAmount'].quantile(0.90)),
            '95%': float(claims_with_amounts['ClaimAmount'].quantile(0.95))
        }
    }

    print(f"   Min: ${amount_stats['min']:,.2f}")
    print(f"   Max: ${amount_stats['max']:,.2f}")
    print(f"   Mean: ${amount_stats['mean']:,.2f}")
    print(f"   Median: ${amount_stats['median']:,.2f}")
    print(f"   90th percentile: ${amount_stats['percentiles']['90%']:,.2f}")
else:
    amount_stats = {}
    print("   No claims with amounts found")

# ============================================================
# PATTERN 5: Demographic Patterns
# ============================================================
print("\n👤 PATTERN 5: Demographic Patterns")

# Driver Age patterns
merged_df['DrivAge'] = pd.to_numeric(merged_df['DrivAge'], errors='coerce')
merged_df['AgeGroup'] = pd.cut(merged_df['DrivAge'], 
                                bins=[18, 25, 35, 50, 65, 100],
                                labels=['18-25', '26-35', '36-50', '51-65', '65+'])
age_claims = merged_df.groupby('AgeGroup')['ClaimNb'].mean()
print("\n   Claims by driver age:")
for age_group, avg_claims in age_claims.items():
    print(f"     {age_group}: {avg_claims:.3f} claims")

# Vehicle Age patterns
merged_df['VehAge'] = pd.to_numeric(merged_df['VehAge'], errors='coerce')
merged_df['VehAgeGroup'] = pd.cut(merged_df['VehAge'], 
                                   bins=[-1, 1, 3, 5, 10, 20, 50],
                                   labels=['0-1 years', '2-3 years', '4-5 years', 
                                           '6-10 years', '11-20 years', '20+ years'])
vehage_claims = merged_df.groupby('VehAgeGroup')['ClaimNb'].mean()
print("\n   Claims by vehicle age:")
for age_group, avg_claims in vehage_claims.items():
    print(f"     {age_group}: {avg_claims:.3f} claims")

# ============================================================
# SAVE ALL PATTERNS FOR GENAI
# ============================================================
print("\n💾 Saving patterns for GenAI transfer...")

patterns = {
    'dataset_info': {
        'total_policies': int(total_policies),
        'total_claims': int(len(sev_df)),
        'claim_rate': round(len(sev_df) / total_policies * 100, 2)
    },
    'claim_frequency': freq_patterns,
    'bonusmalus': bonusmalus_stats,
    'correlations': {
        'bonusmalus_claims_pearson': round(correlation, 3)
    },
    'demographic_patterns': {
        'by_age': {str(k): float(v) for k, v in age_claims.items() if pd.notna(v)},
        'by_vehicle_age': {str(k): float(v) for k, v in vehage_claims.items() if pd.notna(v)}
    }
}

if amount_stats:
    patterns['claim_amounts'] = amount_stats

# Save to JSON
with open(os.path.join(script_dir, "mtpl_patterns.json"), 'w') as f:
    json.dump(patterns, f, indent=2)

print(f"✅ Patterns saved to: {os.path.join(script_dir, 'mtpl_patterns.json')}")
print("\n📊 Pattern extraction complete! Ready for GenAI transfer.")
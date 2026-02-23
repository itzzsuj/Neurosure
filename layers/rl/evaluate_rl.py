# layers/rl/evaluate_rl.py
import pickle
import pandas as pd
from pathlib import Path

print("="*60)
print("🔬 TESTING RL AGENT WITH REAL DATA")
print("="*60)

# Load trained agent
model_file = Path(__file__).parent / "trained_rl_agent.pkl"
with open(model_file, 'rb') as f:
    agent = pickle.load(f)

print("✅ Agent loaded successfully")

# ===============================
# WHEN YOU GET REAL DATA, PUT IT HERE
# ===============================
# Format: cds, erg, pai, brs, actual_outcome
real_cases = [
    # Example - replace with your actual data
    # [0.8, 0.2, 0.3, 0.9, "APPROVE"],
    # [0.3, 0.7, 0.6, 0.8, "REJECT"],
]

if not real_cases:
    print("\n⚠️  No real data yet. Add cases when you get them.")
else:
    action_map = {'APPROVE': 0, 'REJECT': 1, 'REVIEW': 2}
    correct = 0
    
    print("\n📊 Evaluating on real cases:")
    for case in real_cases:
        cds, erg, pai, brs, true_outcome = case
        state = [cds, erg, pai, brs]
        
        agent_action = agent.choose_action(state, training=False)
        agent_decision = agent.get_action_name(agent_action)
        
        match = "✅" if agent_decision == true_outcome else "❌"
        if agent_decision == true_outcome:
            correct += 1
        
        print(f"   {match} State: CDS={cds}, ERG={erg}, PAI={pai}, BRS={brs}")
        print(f"      Agent: {agent_decision}, Truth: {true_outcome}")
    
    accuracy = correct / len(real_cases)
    print(f"\n✅ Real-world accuracy: {accuracy:.3f} ({correct}/{len(real_cases)})")
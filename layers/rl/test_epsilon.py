# layers/rl/test_epsilon.py
from rl_agent import RLAgent

print("="*60)
print("🧪 TESTING EPSILON DECAY")
print("="*60)

# Create agent
agent = RLAgent()
print(f"Initial epsilon: {agent.epsilon:.4f}")

# Simulate 1000 learning steps
for i in range(1000):
    agent.learn([0.5, 0.5, 0.5, 0.5], 0, 1, [0.5, 0.5, 0.5, 0.5])
    
    if i % 100 == 0:
        print(f"Step {i:4d}: epsilon = {agent.epsilon:.4f}")

print(f"\n✅ Final epsilon after 1000 steps: {agent.epsilon:.4f}")
print(f"   Expected final: ~0.01")
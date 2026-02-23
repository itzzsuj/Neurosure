# layers/rl/train_rl.py
import pandas as pd
import numpy as np
from pathlib import Path
from rl_agent import RLAgent
import matplotlib.pyplot as plt
import pickle

print("="*60)
print("🎯 OPTIMIZED RL TRAINING - FIXED EPSILON")
print("="*60)

# ===============================
# LOAD SYNTHETIC DATA
# ===============================
data_file = Path(__file__).parent / "synthetic_rl_data.csv"
df = pd.read_csv(data_file)
print(f"✅ Loaded {len(df)} base samples")

# ===============================
# MAP ACTIONS TO NUMBERS
# ===============================
action_map = {'APPROVE': 0, 'REJECT': 1, 'REVIEW': 2}
df['action_num'] = df['true_action'].map(action_map)

# ===============================
# REWARD FUNCTION
# ===============================
def get_reward(state, action_taken, true_action_num):
    if action_taken == true_action_num:
        return 1.0
    else:
        if (true_action_num == 0 and action_taken == 2) or \
           (true_action_num == 1 and action_taken == 2):
            return 0.3
        else:
            return -0.5

# ===============================
# CREATE AGENT WITH PROPER EPSILON
# ===============================
agent = RLAgent()
# FORCE epsilon to start at 1.0 and decay slowly
agent.epsilon = 1.0
agent.epsilon_min = 0.01
agent.epsilon_decay = 0.999  # Slower decay

print(f"\n🔄 Starting with epsilon = {agent.epsilon:.4f}")

epochs = 100  # 100 epochs = 1,000,000 steps
episodes_per_epoch = len(df) - 1

accuracy_history = []
epsilon_history = []

print(f"🔄 Training for {epochs} epochs ({epochs * episodes_per_epoch:,} total steps)...")

step_counter = 0
for epoch in range(epochs):
    epoch_correct = 0
    epoch_total = 0
    
    # Shuffle data each epoch
    df_shuffled = df.sample(frac=1).reset_index(drop=True)
    
    for i in range(episodes_per_epoch):
        # Get current state
        row = df_shuffled.iloc[i]
        state = [row['cds'], row['erg'], row['pai'], row['brs']]
        true_action = row['action_num']
        
        # Choose action
        action = agent.choose_action(state, training=True)
        
        # Get reward
        reward = get_reward(state, action, true_action)
        
        # Track accuracy
        if action == true_action:
            epoch_correct += 1
        epoch_total += 1
        
        # Next state
        next_row = df_shuffled.iloc[i + 1] if i < episodes_per_epoch - 1 else df_shuffled.iloc[0]
        next_state = [next_row['cds'], next_row['erg'], next_row['pai'], next_row['brs']]
        
        # Learn
        done = (epoch == epochs - 1 and i == episodes_per_epoch - 1)
        agent.learn(state, action, reward, next_state, done)
        
        step_counter += 1
    
    # Calculate epoch accuracy
    epoch_accuracy = epoch_correct / epoch_total
    accuracy_history.append(epoch_accuracy)
    epsilon_history.append(agent.epsilon)
    
    if epoch % 5 == 0:
        print(f"   Epoch {epoch:3d}: Accuracy = {epoch_accuracy:.3f}, Epsilon = {agent.epsilon:.4f}")

# ===============================
# FINAL EVALUATION
# ===============================
print("\n📊 Final Evaluation...")

test_correct = 0
test_total = 2000
test_df = df.sample(n=test_total)

for idx, row in test_df.iterrows():
    state = [row['cds'], row['erg'], row['pai'], row['brs']]
    action = agent.choose_action(state, training=False)
    if action == row['action_num']:
        test_correct += 1

final_accuracy = test_correct / test_total
print(f"\n✅ Final Test Accuracy: {final_accuracy:.3f}")

# ===============================
# SAVE THE TRAINED AGENT
# ===============================
model_file = Path(__file__).parent / "trained_rl_agent_fixed.pkl"
with open(model_file, 'wb') as f:
    pickle.dump(agent, f)

print(f"💾 Agent saved to: {model_file}")

# ===============================
# PLOT TRAINING PROGRESS
# ===============================
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
plt.plot(range(epochs), accuracy_history, 'b-', linewidth=2)
plt.xlabel('Epoch')
plt.ylabel('Training Accuracy')
plt.title(f'RL Training Progress (Final: {final_accuracy:.3f})')
plt.grid(True)

plt.subplot(1, 2, 2)
plt.plot(range(epochs), epsilon_history, 'r-', linewidth=2)
plt.xlabel('Epoch')
plt.ylabel('Epsilon')
plt.title('Epsilon Decay')
plt.grid(True)

plt.tight_layout()
plt.savefig(Path(__file__).parent / 'rl_training_fixed.png')
print("📈 Training plot saved")

print(f"\n✅ Total training steps: {step_counter:,}")
print(f"✅ Final epsilon: {agent.epsilon:.4f}")
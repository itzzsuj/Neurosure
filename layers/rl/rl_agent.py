# layers/rl/rl_agent.py
import numpy as np
import random

class RLAgent:
    """
    Q-Learning Agent for Insurance Claim Decisions
    State: [CDS, ERG, PAI, BRS] (all 0-1)
    Actions: 0=APPROVE, 1=REJECT, 2=REVIEW
    """
    
    def __init__(self, learning_rate=0.1, discount_factor=0.95, exploration_rate=1.0):
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = exploration_rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.999
        self.q_table = {}
        self.action_names = ['APPROVE', 'REJECT', 'REVIEW']
        
    def get_q_value(self, state_key, action):
        """Get Q-value, return 0 if not exists"""
        if state_key not in self.q_table:
            self.q_table[state_key] = [0.0, 0.0, 0.0]
        return self.q_table[state_key][action]

    def set_q_value(self, state_key, action, value):
        """Set Q-value"""
        if state_key not in self.q_table:
            self.q_table[state_key] = [0.0, 0.0, 0.0]
        self.q_table[state_key][action] = value
    
    def discretize_state(self, state):
        """Convert continuous state to discrete for Q-table"""
        cds, erg, pai, brs = state
        # Discretize each value into bins: 0-0.33, 0.33-0.66, 0.66-1.0
        bins = [0, 0.33, 0.66, 1.0]
        cds_bin = np.digitize(cds, bins) - 1
        erg_bin = np.digitize(erg, bins) - 1
        pai_bin = np.digitize(pai, bins) - 1
        brs_bin = np.digitize(brs, bins) - 1
        return (cds_bin, erg_bin, pai_bin, brs_bin)
    
    def choose_action(self, state, training=True):
        """Epsilon-greedy action selection"""
        if training and random.random() < self.epsilon:
            return random.randint(0, 2)  # Explore
        
        discrete_state = self.discretize_state(state)
        
        # Get Q-values for this state
        if discrete_state not in self.q_table:
            self.q_table[discrete_state] = [0.0, 0.0, 0.0]
        
        # Exploit - choose best action
        return int(np.argmax(self.q_table[discrete_state]))
    
    # ===== FIXED: learn method with epsilon decay EVERY step =====
    def learn(self, state, action, reward, next_state, done=False):
        """Q-learning update rule with proper epsilon decay"""
        discrete_state = self.discretize_state(state)
        discrete_next = self.discretize_state(next_state)
        
        # Ensure Q-values exist
        if discrete_state not in self.q_table:
            self.q_table[discrete_state] = [0.0, 0.0, 0.0]
        if discrete_next not in self.q_table:
            self.q_table[discrete_next] = [0.0, 0.0, 0.0]
        
        # Current Q-value
        current_q = self.q_table[discrete_state][action]
        
        # Maximum Q-value for next state
        max_next_q = np.max(self.q_table[discrete_next])
        
        # Q-learning formula
        if done:
            target = reward
        else:
            target = reward + self.gamma * max_next_q
        
        # Update
        new_q = current_q + self.lr * (target - current_q)
        self.q_table[discrete_state][action] = new_q
        
        # ===== FIX: Decay epsilon EVERY STEP, not just at end =====
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
    
    def get_action_name(self, action):
        """Convert action number to name"""
        return self.action_names[action]
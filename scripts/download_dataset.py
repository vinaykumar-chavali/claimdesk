import os
import pandas as pd
import numpy as np

def generate_synthetic_data(num_rows=10000):
    np.random.seed(42)
    print(f"Generating {num_rows} rows of synthetic claim data...")
    
    # 1. policy_type
    policy_types = np.random.choice(['automobile', 'health'], size=num_rows, p=[0.5, 0.5])
    
    # 2. event_type
    auto_events = ['Collision', 'Theft', 'Fire', 'Vandalism', 'Flood', 'Hit & Run']
    health_events = ['Hospitalization', 'Surgery', 'Emergency', 'Outpatient', 'Pharmacy']
    
    event_types = []
    for pt in policy_types:
        if pt == 'automobile':
            event_types.append(np.random.choice(auto_events))
        else:
            event_types.append(np.random.choice(health_events))
            
    # 3. injury_severity
    injury_severities = np.random.choice(['None', 'Minor', 'Major'], size=num_rows, p=[0.5, 0.35, 0.15])
    
    # 4. coverage_amount
    coverages = [30000, 50000, 75000, 100000, 150000, 250000]
    coverage_amounts = np.random.choice(coverages, size=num_rows)
    
    # 5. claim_amount
    claim_amounts = []
    for pt, et in zip(policy_types, event_types):
        if pt == 'automobile':
            if et in ['Collision', 'Fire']:
                base = np.random.normal(15000, 5000)
            elif et == 'Theft':
                base = np.random.normal(25000, 8000)
            else:
                base = np.random.normal(5000, 2000)
        else:
            if et in ['Surgery', 'Hospitalization']:
                base = np.random.normal(40000, 15000)
            elif et == 'Emergency':
                base = np.random.normal(8000, 3000)
            else:
                base = np.random.normal(1000, 500)
        claim_amounts.append(max(100, min(base, 250000))) # clip between 100 and 250k
        
    df = pd.DataFrame({
        'policy_type': policy_types,
        'event_type': event_types,
        'injury_severity': injury_severities,
        'claim_amount': claim_amounts,
        'coverage_amount': coverage_amounts
    })
    
    # 6. description
    df['description'] = df['event_type'] + " reported with " + df['injury_severity'] + " injury."
    
    # 7. coverage_ratio
    df['coverage_ratio'] = df['claim_amount'] / df['coverage_amount']
    
    # 8. Engineer priority label
    HIGH_EVENTS = ['Fire', 'Theft', 'Collision', 'Surgery', 'Emergency']
    median_claim = df['claim_amount'].median()
    
    df['priority'] = (
        ((df['claim_amount'] > median_claim) & df['event_type'].isin(HIGH_EVENTS)) |
        (df['injury_severity'] == 'Major')
    ).astype(int)
    
    return df

def main():
    df = generate_synthetic_data()
    
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml-service", "data")
    os.makedirs(out_dir, exist_ok=True)
    
    out_path = os.path.join(out_dir, "insurance_claims_processed.csv")
    df.to_csv(out_path, index=False)
    
    print(f"Saved dataset to {out_path}")
    print("\nClass distribution (Priority = 1):")
    print(df['priority'].value_counts(normalize=True))
    print(df['priority'].value_counts())

if __name__ == "__main__":
    main()

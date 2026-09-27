import os
import pandas as pd
import numpy as np
import joblib
import shap
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from xgboost import XGBClassifier

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "ml-service", "data", "insurance_claims_processed.csv")
    
    if not os.path.exists(data_path):
        print(f"Data file not found at {data_path}. Please run download_dataset.py first.")
        return
        
    print(f"Loading data from {data_path}...")
    df = pd.read_csv(data_path)
    
    # 2. Split features/target
    X = df[['policy_type', 'event_type', 'injury_severity', 'claim_amount', 'coverage_ratio', 'description']]
    y = df['priority']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Building preprocessing pipeline...")
    # 3. Build ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['policy_type', 'event_type', 'injury_severity']),
            ('num', StandardScaler(), ['claim_amount', 'coverage_ratio']),
            ('text', TfidfVectorizer(max_features=200), 'description')
        ],
        remainder='drop'
    )
    
    # Calculate scale_pos_weight
    pos_count = sum(y_train == 1)
    neg_count = sum(y_train == 0)
    scale_pos_weight = neg_count / max(pos_count, 1)
    
    print("Fitting preprocessor...")
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    
    # 4 & 5. Build and tune XGBClassifier
    print("Training XGBClassifier with GridSearchCV...")
    xgb = XGBClassifier(
        objective='binary:logistic',
        scale_pos_weight=scale_pos_weight,
        eval_metric='auc',
        random_state=42
    )
    
    param_grid = {
        'n_estimators': [50, 100],
        'max_depth': [3, 5],
        'learning_rate': [0.1, 0.2]
    }
    
    grid_search = GridSearchCV(xgb, param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
    grid_search.fit(X_train_transformed, y_train)
    
    best_model = grid_search.best_estimator_
    print(f"Best parameters: {grid_search.best_params_}")
    
    # 6. Evaluation
    y_pred = best_model.predict(X_test_transformed)
    y_prob = best_model.predict_proba(X_test_transformed)[:, 1]
    
    auc = roc_auc_score(y_test, y_prob)
    print("\n--- Evaluation Metrics ---")
    print(f"AUC-ROC: {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # 7. Assert AUC-ROC >= 0.85
    assert auc >= 0.85, f"Model failed to reach target AUC (Got {auc:.4f}, expected >= 0.85)"
    print("\nTarget metrics met! AUC >= 0.85")
    
    # 8. Save models
    models_dir = os.path.join(base_dir, "ml-service", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    prep_path = os.path.join(models_dir, "preprocessor.pkl")
    model_path = os.path.join(models_dir, "xgb_priority.pkl")
    
    joblib.dump(preprocessor, prep_path)
    joblib.dump(best_model, model_path)
    
    # 9. SHAP TreeExplainer - testing that it works (actually saved/re-created in service)
    explainer = shap.TreeExplainer(best_model)
    print("SHAP explainer verified.")
    
    # 10. Print success
    print("Model saved successfully.")

if __name__ == "__main__":
    main()

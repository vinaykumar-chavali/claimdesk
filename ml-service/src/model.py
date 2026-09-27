import os
import joblib
import shap
import pandas as pd
import numpy as np
from src.schemas import AnalyzeRequest, AnalyzeResponse, PriorityFeature

# Global variables for model artifacts
PREPROCESSOR = None
XGB_MODEL = None
EXPLAINER = None
MODEL_LOADED = False

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
PREPROCESSOR_PATH = os.path.join(MODEL_DIR, "preprocessor.pkl")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_priority.pkl")

def load_models():
    global PREPROCESSOR, XGB_MODEL, EXPLAINER, MODEL_LOADED
    try:
        if os.path.exists(PREPROCESSOR_PATH) and os.path.exists(MODEL_PATH):
            PREPROCESSOR = joblib.load(PREPROCESSOR_PATH)
            XGB_MODEL = joblib.load(MODEL_PATH)
            
            # Recreate explainer if not saved/loaded
            # For tree models, we can recreate it easily
            EXPLAINER = shap.TreeExplainer(XGB_MODEL)
            MODEL_LOADED = True
            print("Model loaded successfully.")
        else:
            print("Model files not found. Using rule-based fallback.")
            MODEL_LOADED = False
    except Exception as e:
        print(f"Error loading models: {e}")
        MODEL_LOADED = False

def build_features(req: AnalyzeRequest) -> dict:
    # Unify incident/treatment into one 'event_type' feature
    event_type = req.incident_type or req.treatment_type or 'Other'
    coverage_ratio = req.claim_amount / max(req.coverage_amount, 1)
    return {
        'policy_type': req.policy_type,
        'event_type': event_type,
        'injury_severity': req.injury_severity,
        'claim_amount': req.claim_amount,
        'coverage_ratio': coverage_ratio,
        'description': req.description,
    }

def rule_based_score(req: AnalyzeRequest) -> AnalyzeResponse:
    score = 0.3
    high_event = req.incident_type in ['Fire','Theft','Collision'] or req.treatment_type in ['Surgery','Emergency']
    if req.claim_amount > 20000: score += 0.25
    if req.injury_severity == 'Major': score += 0.30
    elif req.injury_severity == 'Minor': score += 0.10
    if high_event: score += 0.20
    score = min(score, 0.99)
    label = 'priority' if score >= 0.55 else 'non_priority'
    return AnalyzeResponse(
        priority_label=label,
        priority_score=round(score, 4),
        priority_reason=[
            PriorityFeature(feature='rule_based_scoring', impact=f'{score:+.2f}')
        ]
    )

def predict_priority(req: AnalyzeRequest) -> AnalyzeResponse:
    if not MODEL_LOADED:
        return rule_based_score(req)
        
    try:
        # Build features
        feat_dict = build_features(req)
        
        # Convert to DataFrame (ensure correct dtypes)
        df = pd.DataFrame([feat_dict])
        
        # Preprocess
        X_transformed = PREPROCESSOR.transform(df)
        
        # Predict probability
        proba = XGB_MODEL.predict_proba(X_transformed)[0, 1]
        
        # Determine label
        label = 'priority' if proba >= 0.5 else 'non_priority'
        
        # Get SHAP values
        shap_values = EXPLAINER.shap_values(X_transformed)
        if isinstance(shap_values, list):
            shap_values = shap_values[1] # For binary classification, take positive class
            
        shap_vals = shap_values[0] # First sample
        
        # Get feature names from preprocessor
        feature_names = PREPROCESSOR.get_feature_names_out()
        
        # Map shap values to feature names
        feature_impacts = list(zip(feature_names, shap_vals))
        
        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
        
        # Get top 3 features
        top_features = []
        for feat, impact in feature_impacts[:3]:
            impact_str = f"{impact:+.4f}"
            
            # Make feature name more readable if possible
            clean_feat = feat.split('__')[-1] if '__' in feat else feat
            
            top_features.append(PriorityFeature(feature=clean_feat, impact=impact_str))
            
        return AnalyzeResponse(
            priority_label=label,
            priority_score=float(round(proba, 4)),
            priority_reason=top_features
        )
        
    except Exception as e:
        print(f"Prediction error: {e}")
        # Fallback to rule-based on error
        return rule_based_score(req)

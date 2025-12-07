import numpy as np
from typing import Dict, Any, List
import xgboost as xgb
import pickle
import os
from collections import Counter
from datetime import datetime, timedelta

class Predictor:
    def __init__(self):
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained XGBoost model or create new one"""
        model_path = "app/models/predictor_model.pkl"
        
        if os.path.exists(model_path) and os.path.getsize(model_path) > 100:
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("Loaded pre-trained predictor model")
            except Exception as e:
                print(f"Failed to load predictor model: {e}. Using heuristic-based prediction.")
                self.model = None
        else:
            self.model = None
            print("No pre-trained model found. Using heuristic-based prediction.")
    
    def _extract_features(self, logs: List[Dict[str, Any]]) -> np.ndarray:
        """Extract time-series features from logs"""
        if not logs:
            return np.zeros(10).reshape(1, -1)
        
        # Count by level
        levels = [log.get("level", "INFO") for log in logs]
        level_counts = Counter(levels)
        
        error_count = level_counts.get("ERROR", 0) + level_counts.get("CRITICAL", 0)
        warning_count = level_counts.get("WARNING", 0)
        total_count = len(logs)
        
        # Error rate
        error_rate = error_count / max(total_count, 1)
        warning_rate = warning_count / max(total_count, 1)
        
        # Message length statistics
        message_lengths = [len(log.get("message", "")) for log in logs]
        avg_length = np.mean(message_lengths) if message_lengths else 0
        
        # Keywords
        error_keywords = ["exception", "failed", "error", "timeout", "crash"]
        keyword_count = sum(
            1 for log in logs 
            if any(kw in log.get("message", "").lower() for kw in error_keywords)
        )
        keyword_rate = keyword_count / max(total_count, 1)
        
        # Service diversity (if available)
        services = [log.get("service", "unknown") for log in logs]
        service_count = len(set(services))
        
        features = np.array([
            total_count,
            error_count,
            warning_count,
            error_rate,
            warning_rate,
            avg_length,
            keyword_count,
            keyword_rate,
            service_count,
            1.0  # placeholder for time-based feature
        ])
        
        return features.reshape(1, -1)
    
    def predict_failure(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict failure probability based on recent logs
        """
        try:
            features = self._extract_features(logs)
            
            # If no trained model, use heuristic-based prediction
            if self.model is None:
                error_rate = features[0, 3]  # error_rate
                keyword_rate = features[0, 7]  # keyword_rate
                
                # Simple heuristic
                probability = min((error_rate * 0.6 + keyword_rate * 0.4), 1.0)
                
                if probability > 0.7:
                    prediction = "high_risk"
                elif probability > 0.4:
                    prediction = "medium_risk"
                else:
                    prediction = "low_risk"
                
                confidence = 0.6  # Moderate confidence for heuristic
            else:
                # Use trained model
                dmatrix = xgb.DMatrix(features)
                probability = float(self.model.predict(dmatrix)[0])
                
                if probability > 0.7:
                    prediction = "high_risk"
                elif probability > 0.4:
                    prediction = "medium_risk"
                else:
                    prediction = "low_risk"
                
                confidence = 0.85
            
            return {
                "prediction": prediction,
                "probability": float(probability),
                "confidence": float(confidence),
                "features": {
                    "total_logs": int(features[0, 0]),
                    "error_count": int(features[0, 1]),
                    "error_rate": float(features[0, 3])
                }
            }
        
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                "prediction": "unknown",
                "probability": 0.0,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def train(self, X: np.ndarray, y: np.ndarray):
        """Train XGBoost model"""
        try:
            dtrain = xgb.DMatrix(X, label=y)
            params = {
                'max_depth': 6,
                'eta': 0.3,
                'objective': 'binary:logistic',
                'eval_metric': 'logloss'
            }
            
            self.model = xgb.train(params, dtrain, num_boost_round=100)
            
            # Save model
            model_path = "app/models/predictor_model.pkl"
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            return True
        except Exception as e:
            print(f"Training failed: {e}")
            return False

# Singleton instance
predictor = Predictor()

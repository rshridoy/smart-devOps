import numpy as np
from typing import Dict, Any, Tuple
from pyod.models.iforest import IForest
from sentence_transformers import SentenceTransformer
import pickle
import os

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.encoder = None
        self.threshold = 0.5
        self._load_model()
        self._load_encoder()
    
    def _load_model(self):
        """Load pre-trained anomaly detection model or create new one"""
        model_path = "app/models/anomaly_model.pkl"
        
        if os.path.exists(model_path) and os.path.getsize(model_path) > 100:
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("Loaded pre-trained anomaly detection model")
            except Exception as e:
                print(f"Failed to load model: {e}. Using new model.")
                self.model = IForest(contamination=0.1, random_state=42)
        else:
            # Initialize with Isolation Forest
            self.model = IForest(contamination=0.1, random_state=42)
            print("Initialized new anomaly detection model")
    
    def _load_encoder(self):
        """Load sentence transformer for text embedding"""
        try:
            self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Failed to load encoder: {e}")
            self.encoder = None
    
    def _extract_features(self, log: Dict[str, Any]) -> np.ndarray:
        """Extract features from log entry"""
        if not self.encoder:
            # Fallback: simple feature extraction
            features = [
                len(log.get("message", "")),
                1 if log.get("level") == "ERROR" else 0,
                1 if log.get("level") == "CRITICAL" else 0
            ]
            return np.array(features).reshape(1, -1)
        
        # Use sentence transformer for message embedding
        message = log.get("message", "")
        embedding = self.encoder.encode(message)
        
        # Add level encoding
        level_encoding = {
            "DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4
        }
        level_val = level_encoding.get(log.get("level", "INFO"), 1)
        
        # Combine features
        features = np.append(embedding, [level_val, len(message)])
        return features.reshape(1, -1)
    
    def detect_anomaly(self, log: Dict[str, Any]) -> Tuple[bool, float]:
        """
        Detect if a log entry is anomalous
        Returns: (is_anomaly, anomaly_score)
        """
        try:
            features = self._extract_features(log)
            
            # For new model without training data, use heuristics
            if not hasattr(self.model, 'decision_scores_'):
                # Simple heuristic-based detection
                is_error = log.get("level") in ["ERROR", "CRITICAL"]
                has_keywords = any(keyword in log.get("message", "").lower() 
                                 for keyword in ["exception", "failed", "error", "timeout", "crash"])
                
                if is_error or has_keywords:
                    return True, 0.8
                return False, 0.2
            
            # Use trained model
            score = self.model.decision_function(features)[0]
            is_anomaly = score > self.threshold
            
            # Normalize score to 0-1 range
            normalized_score = min(max((score + 0.5) / 1.5, 0), 1)
            
            return bool(is_anomaly), float(normalized_score)
        
        except Exception as e:
            print(f"Anomaly detection error: {e}")
            return False, 0.0
    
    def train(self, logs: list):
        """Train model on historical logs"""
        try:
            features = np.vstack([self._extract_features(log) for log in logs])
            self.model.fit(features)
            
            # Save model
            model_path = "app/models/anomaly_model.pkl"
            os.makedirs(os.path.dirname(model_path), exist_ok=True)
            with open(model_path, 'wb') as f:
                pickle.dump(self.model, f)
            
            return True
        except Exception as e:
            print(f"Training failed: {e}")
            return False

# Singleton instance
anomaly_detector = AnomalyDetector()

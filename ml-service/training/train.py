"""Train RandomForest model and save to model/model.joblib."""

import json
import os
import sys

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split

# Add parent to path so we can import data_gen
sys.path.insert(0, os.path.dirname(__file__))
from data_gen import generate_dataset, FEATURES


def train():
    print("Generating synthetic dataset...")
    df = generate_dataset(n_samples=10000, random_state=42)

    X = df[FEATURES].values
    y = df["risk"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training set: {len(X_train)}, Test set: {len(X_test)}")
    print(f"Risk distribution (train): {np.bincount(y_train).tolist()}")
    print(f"Risk distribution (test):  {np.bincount(y_test).tolist()}")

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=42,
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred)), 4),
        "recall": round(float(recall_score(y_test, y_pred)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
        "n_train_samples": len(X_train),
        "n_test_samples": len(X_test),
        "n_estimators": 200,
        "max_depth": 8,
    }

    print("\n=== Model Evaluation Metrics ===")
    for key, value in metrics.items():
        print(f"  {key}: {value}")
    print("================================\n")

    if metrics["roc_auc"] < 0.85:
        print(f"WARNING: AUC {metrics['roc_auc']:.4f} is below expected 0.85 threshold")

    # Save artifacts
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")
    os.makedirs(model_dir, exist_ok=True)

    # 1. Save model
    model_path = os.path.join(model_dir, "model.joblib")
    joblib.dump({"model": clf, "features": FEATURES}, model_path)
    print(f"Model saved to {model_path}")

    # 2. Save feature names
    feature_names_path = os.path.join(model_dir, "feature_names.json")
    with open(feature_names_path, "w") as f:
        json.dump(FEATURES, f, indent=2)
    print(f"Feature names saved to {feature_names_path}")

    # 3. Save metrics
    metrics_path = os.path.join(model_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_path}")


if __name__ == "__main__":
    train()

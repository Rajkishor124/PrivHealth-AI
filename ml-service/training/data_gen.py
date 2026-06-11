"""Synthetic data generation for health risk prediction model."""

import numpy as np
import pandas as pd


FEATURES = ["age", "blood_pressure", "cholesterol", "diabetes", "bmi", "heart_rate"]


def sigmoid(z: np.ndarray) -> np.ndarray:
    return 1 / (1 + np.exp(-z))


def generate_dataset(n_samples: int = 10000, random_state: int = 42) -> pd.DataFrame:
    """Generate synthetic health data with realistic distributions."""
    rng = np.random.RandomState(random_state)

    age = rng.uniform(18, 90, n_samples)
    blood_pressure = np.clip(rng.normal(125, 20, n_samples), 80, 220).astype(int)
    cholesterol = np.clip(rng.normal(200, 40, n_samples), 100, 400).astype(int)
    diabetes = rng.binomial(1, 0.2, n_samples)
    bmi = np.clip(rng.normal(26, 5, n_samples), 15, 50)
    heart_rate = np.clip(rng.normal(75, 12, n_samples), 40, 180).astype(int)

    # Logistic ground truth + noise
    z = (
        0.045 * (age - 50)
        + 0.02 * (blood_pressure - 120)
        + 0.012 * (cholesterol - 200)
        + 0.09 * (bmi - 25)
        + 1.1 * diabetes
        + 0.012 * (heart_rate - 75)
        - 0.4
    )
    p = sigmoid(z)
    label = rng.binomial(1, p)

    df = pd.DataFrame({
        "age": age.astype(int),
        "blood_pressure": blood_pressure,
        "cholesterol": cholesterol,
        "diabetes": diabetes,
        "bmi": np.round(bmi, 1),
        "heart_rate": heart_rate,
        "risk": label,
    })

    return df


if __name__ == "__main__":
    df = generate_dataset()
    print(f"Generated {len(df)} samples")
    print(f"Risk distribution:\n{df['risk'].value_counts()}")
    print(f"\nSample:\n{df.head()}")

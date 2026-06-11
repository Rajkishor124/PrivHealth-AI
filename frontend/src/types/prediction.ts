import type { RiskCategory } from './patient';

export interface PredictionInput {
  age: number;
  bloodPressure: number;
  cholesterol: number;
  diabetes: boolean;
  bmi: number;
  heartRate: number;
}

export interface Prediction {
  id: number;
  patientId: number;
  patientName: string;
  riskScore: number;
  riskCategory: RiskCategory;
  input: PredictionInput;
  createdAt: string;
  explanations?: FeatureContribution[];
}

export interface PredictionRequest {
  patientId: number;
  age: number;
  bloodPressure: number;
  cholesterol: number;
  diabetes: boolean;
  bmi: number;
  heartRate: number;
}

export interface FeatureContribution {
  featureName: string;
  contribution: number;
}

export interface Explanation {
  predictionId: number;
  riskScore: number;
  riskCategory: RiskCategory;
  baseValue: number;
  contributions: FeatureContribution[];
}

export type TargetDisease = 'DIABETES' | 'HEART_DISEASE' | 'HYPERTENSION';
export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskAlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExplanationDto {
    featureName: string;
    contributionValue: number;
}

export interface RiskAssessmentResponse {
    id: number;
    patientId: number;
    targetDisease: TargetDisease;
    riskCategory: RiskCategory;
    riskScore: number;
    confidenceScore: number;
    modelVersion: string;
    predictionSummary: string;
    recommendations: string;
    generatedAt: string;
    explanations: ExplanationDto[];
}

export interface RiskAlertResponse {
    id: number;
    patientId: number;
    alertType: string;
    severity: RiskAlertSeverity;
    message: string;
    generatedAt: string;
}

export interface GeneratePredictionRequest {
    patientId: number;
}

import { env } from '../config/env';

export interface MLAnalysisPayload {
  policy_type: string;
  incident_type?: string;
  treatment_type?: string;
  injury_severity?: string;
  claim_amount: number;
  coverage_amount: number;
  description: string;
}

export interface MLAnalysisResult {
  priority_label: string;
  priority_score: number;
  priority_reason: Record<string, any>;
}

export const analyzeClaimPriority = async (payload: MLAnalysisPayload): Promise<MLAnalysisResult | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(env.ML_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`ML service returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data as MLAnalysisResult;
  } catch (error) {
    console.error('ML service analysis failed:', error);
    return null; // Do not throw, claim creation must succeed
  }
};

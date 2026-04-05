import type { FitnessGoal, WeightUnit, Gender, ActivityLevel, AIReport } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

export async function generateFitnessPlan(
  goal: FitnessGoal,
  currentWeight: number,
  targetWeight: number,
  weightUnit: WeightUnit,
  timelineWeeks: number,
  gender: Gender,
  age: number,
  heightCm: number,
  activityLevel: ActivityLevel
): Promise<AIReport> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  const response = await fetch(`${API_BASE_URL}/api/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: controller.signal,
    body: JSON.stringify({
      goal,
      current_weight: currentWeight,
      target_weight: targetWeight,
      weight_unit: weightUnit,
      timeline_weeks: timelineWeeks,
      gender,
      age,
      height_cm: heightCm,
      activity_level: activityLevel,
    }),
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.detail || response.statusText;
    throw new Error(`${response.status}: ${msg}`);
  }

  const report: AIReport = await response.json();
  return report;
}

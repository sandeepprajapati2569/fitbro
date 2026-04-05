import { z } from 'zod';
import type { FitnessGoal } from '../types';

export const weightSchema = z.object({
  currentWeight: z.number().min(30, 'Minimum weight is 30 kg').max(300, 'Maximum weight is 300 kg'),
  targetWeight: z.number().min(30, 'Minimum weight is 30 kg').max(300, 'Maximum weight is 300 kg'),
});

export function validateWeightsForGoal(
  currentWeight: number,
  targetWeight: number,
  goal: FitnessGoal
): string | null {
  if (goal === 'lose_weight' && targetWeight >= currentWeight) {
    return 'Target weight should be less than your current weight for weight loss';
  }
  if (goal === 'gain_weight' && targetWeight <= currentWeight) {
    return 'Target weight should be more than your current weight for weight gain';
  }
  return null;
}

export const timelineSchema = z.object({
  timelineWeeks: z
    .number()
    .int('Please enter a whole number')
    .min(1, 'Minimum is 1 week')
    .max(104, 'Maximum is 2 years (104 weeks)'),
});

export function getWeightChangeRate(
  currentWeight: number,
  targetWeight: number,
  weeks: number
): number {
  return Math.abs(currentWeight - targetWeight) / weeks;
}

export function isAggressiveTimeline(
  currentWeight: number,
  targetWeight: number,
  weeks: number
): boolean {
  return getWeightChangeRate(currentWeight, targetWeight, weeks) > 1;
}

export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value;
  if (from === 'kg') return Math.round(value * 2.20462 * 10) / 10;
  return Math.round(value / 2.20462 * 10) / 10;
}

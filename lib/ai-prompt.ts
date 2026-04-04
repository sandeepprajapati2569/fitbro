import type { FitnessGoal, WeightUnit } from '../types';

export function buildPrompt(
  goal: FitnessGoal,
  currentWeight: number,
  targetWeight: number,
  weightUnit: WeightUnit,
  timelineWeeks: number
): string {
  const goalText = goal === 'lose_weight' ? 'lose weight' : 'gain weight';
  const delta = Math.abs(currentWeight - targetWeight);

  return `You are a certified fitness and nutrition expert. Create a personalized fitness and nutrition plan based on the following user profile:

- Goal: ${goalText}
- Current weight: ${currentWeight} ${weightUnit}
- Target weight: ${targetWeight} ${weightUnit}
- Weight change needed: ${delta} ${weightUnit}
- Timeline: ${timelineWeeks} weeks

Generate a comprehensive 7-day plan. Respond ONLY with valid JSON matching this exact structure (no markdown, no code blocks, just raw JSON):

{
  "summary": "A brief 2-3 sentence personalized summary mentioning the user's exact current weight (${currentWeight} ${weightUnit}), target weight (${targetWeight} ${weightUnit}), the ${delta} ${weightUnit} change needed, and the ${timelineWeeks}-week timeline",
  "dailyCalorieTarget": <number>,
  "workoutPlan": [
    {
      "day": "Monday",
      "exercises": [
        {
          "name": "Exercise name",
          "sets": <number>,
          "reps": "12" or "30 sec",
          "restSeconds": <number>
        }
      ],
      "durationMinutes": <number>
    }
  ],
  "mealPlan": [
    {
      "day": "Monday",
      "meals": [
        {
          "type": "breakfast" | "lunch" | "dinner" | "snack",
          "name": "Meal name",
          "calories": <number>,
          "protein": <number in grams>,
          "carbs": <number in grams>,
          "fat": <number in grams>,
          "ingredients": ["ingredient 1", "ingredient 2"]
        }
      ],
      "totalCalories": <number>
    }
  ],
  "supplementRecommendations": ["supplement 1", "supplement 2"]
}

Include all 7 days (Monday through Sunday). Each day should have 4 meals (breakfast, lunch, dinner, snack). Include at least 4 exercises per workout day. Include a rest day. Include 3-5 supplement recommendations. Make the plan realistic, safe, and progressive.`;
}

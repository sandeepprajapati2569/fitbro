export type FitnessGoal = 'lose_weight' | 'gain_weight';

export type WeightUnit = 'kg' | 'lbs';

export type Gender = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export interface CalculatedMetrics {
  bmr: number;
  tdee: number;
  daily_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  weekly_weight_change_kg: number;
  deficit_or_surplus: number;
}

export interface WizardState {
  goal: FitnessGoal | null;
  currentWeight: number | null;
  targetWeight: number | null;
  weightUnit: WeightUnit;
  timelineWeeks: number | null;
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  aiReport: AIReport | null;
  isLoading: boolean;
  error: string | null;
}

export interface AIReport {
  id: string;
  calculated: CalculatedMetrics;
  summary: string;
  dailyCalorieTarget: number;
  workoutPlan: WorkoutDay[];
  mealPlan: MealDay[];
  supplementRecommendations: string[];
}

export interface WorkoutDay {
  day: string;
  exercises: Exercise[];
  durationMinutes: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface MealDay {
  day: string;
  meals: Meal[];
  totalCalories: number;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

export interface AffiliateLink {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  category: 'supplement' | 'meal_kit' | 'equipment' | 'app';
  matchKeywords: string[];
}

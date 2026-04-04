from pydantic import BaseModel


class CalculatedMetrics(BaseModel):
    bmr: int
    tdee: int
    daily_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    weekly_weight_change_kg: float
    deficit_or_surplus: int


class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    restSeconds: int


class WorkoutDay(BaseModel):
    day: str
    exercises: list[Exercise]
    durationMinutes: int


class Meal(BaseModel):
    type: str
    name: str
    calories: int
    protein: int
    carbs: int
    fat: int
    ingredients: list[str]


class MealDay(BaseModel):
    day: str
    meals: list[Meal]
    totalCalories: int


class PlanResponse(BaseModel):
    id: str
    calculated: CalculatedMetrics
    summary: str
    dailyCalorieTarget: int
    workoutPlan: list[WorkoutDay]
    mealPlan: list[MealDay]
    supplementRecommendations: list[str]


class PlanSummary(BaseModel):
    id: str
    created_at: str
    goal: str
    daily_calories: int
    current_weight: float
    target_weight: float
    weight_unit: str
    timeline_weeks: int

import json
from openai import AsyncOpenAI
from models.request import GeneratePlanRequest
from models.response import CalculatedMetrics


def _build_constrained_prompt(
    req: GeneratePlanRequest, metrics: CalculatedMetrics
) -> str:
    goal_text = "lose weight" if req.goal == "lose_weight" else "gain weight"
    weight_kg = req.current_weight if req.weight_unit == "kg" else round(req.current_weight * 0.453592, 1)
    target_kg = req.target_weight if req.weight_unit == "kg" else round(req.target_weight * 0.453592, 1)
    delta = abs(req.current_weight - req.target_weight)

    return f"""Create a personalized 7-day fitness and nutrition plan for this user:

PROFILE:
- Goal: {goal_text}
- Gender: {req.gender}, Age: {req.age}, Height: {req.height_cm} cm
- Current weight: {req.current_weight} {req.weight_unit}
- Target weight: {req.target_weight} {req.weight_unit}
- Weight to {goal_text.split()[0]}: {delta:.1f} {req.weight_unit}
- Timeline: {req.timeline_weeks} weeks
- Activity level: {req.activity_level.replace('_', ' ')}

CALCULATED TARGETS (use these EXACT numbers):
- Daily calorie target: {metrics.daily_calories} kcal
- Daily protein: {metrics.protein_g}g
- Daily carbs: {metrics.carbs_g}g
- Daily fat: {metrics.fat_g}g
- BMR: {metrics.bmr} kcal | TDEE: {metrics.tdee} kcal
- Weekly weight change rate: {metrics.weekly_weight_change_kg} kg/week

STRICT RULES:
1. Each day's total meal calories MUST equal exactly {metrics.daily_calories} kcal (+/- 30 kcal).
2. Each day's total protein MUST be approximately {metrics.protein_g}g (+/- 10g).
3. Each day's total carbs MUST be approximately {metrics.carbs_g}g (+/- 10g).
4. Each day's total fat MUST be approximately {metrics.fat_g}g (+/- 5g).
5. Each meal's calories must equal protein*4 + carbs*4 + fat*9 (within +/- 20 kcal).
6. Include one rest day (Sunday).
7. For {"fat loss" if req.goal == "lose_weight" else "muscle gain"}, focus workouts on {"HIIT + compound lifts to maximize calorie burn" if req.goal == "lose_weight" else "progressive overload with compound movements for hypertrophy"}.

The summary must mention: the user's current weight ({req.current_weight} {req.weight_unit}), target weight ({req.target_weight} {req.weight_unit}), the exact calorie target ({metrics.daily_calories} kcal/day), and the timeline ({req.timeline_weeks} weeks).

Respond ONLY with valid JSON matching this structure:
{{
  "summary": "Personalized 2-3 sentence summary with exact numbers",
  "dailyCalorieTarget": {metrics.daily_calories},
  "workoutPlan": [
    {{
      "day": "Monday",
      "exercises": [
        {{ "name": "Exercise name", "sets": 3, "reps": "12", "restSeconds": 60 }}
      ],
      "durationMinutes": 45
    }}
  ],
  "mealPlan": [
    {{
      "day": "Monday",
      "meals": [
        {{
          "type": "breakfast",
          "name": "Meal name",
          "calories": 500,
          "protein": 35,
          "carbs": 45,
          "fat": 18,
          "ingredients": ["ingredient 1", "ingredient 2"]
        }}
      ],
      "totalCalories": {metrics.daily_calories}
    }}
  ],
  "supplementRecommendations": ["supplement 1", "supplement 2"]
}}

Include all 7 days (Monday-Sunday). Each day: 4 meals (breakfast, lunch, dinner, snack). At least 4 exercises per workout day. 3-5 supplement recommendations."""


async def generate_ai_plan(
    api_key: str, req: GeneratePlanRequest, metrics: CalculatedMetrics
) -> dict:
    client = AsyncOpenAI(api_key=api_key)
    prompt = _build_constrained_prompt(req, metrics)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a certified fitness and nutrition expert. "
                "You MUST use the exact calorie and macro targets provided. "
                "Respond ONLY with valid JSON, no markdown or code blocks.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=8192,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("No response from AI")

    plan = json.loads(content)

    # --- Validate & fix calorie consistency ---
    plan["dailyCalorieTarget"] = metrics.daily_calories
    for meal_day in plan.get("mealPlan", []):
        total = sum(m.get("calories", 0) for m in meal_day.get("meals", []))
        meal_day["totalCalories"] = total

    return plan

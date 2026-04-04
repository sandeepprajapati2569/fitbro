import json
from openai import AsyncOpenAI
from models.request import GeneratePlanRequest
from models.response import CalculatedMetrics


def _build_constrained_prompt(
    req: GeneratePlanRequest, metrics: CalculatedMetrics
) -> str:
    goal_text = "lose weight" if req.goal == "lose_weight" else "gain weight"
    delta = abs(req.current_weight - req.target_weight)

    # Pre-calculate per-meal targets for the AI
    meal_cal = metrics.daily_calories // 4
    breakfast_cal = round(metrics.daily_calories * 0.25)
    lunch_cal = round(metrics.daily_calories * 0.30)
    dinner_cal = round(metrics.daily_calories * 0.30)
    snack_cal = metrics.daily_calories - breakfast_cal - lunch_cal - dinner_cal

    meal_protein = metrics.protein_g // 4
    meal_carbs = metrics.carbs_g // 4
    meal_fat = metrics.fat_g // 4

    if req.goal == "lose_weight":
        workout_focus = (
            "Include compound movements (squats, deadlifts, bench press, rows) for muscle preservation. "
            "Add 2-3 HIIT or cardio sessions. Vary intensity across the week. "
            "Use specific rep ranges: strength (4-6 reps), hypertrophy (8-12 reps), endurance (15-20 reps)."
        )
    else:
        workout_focus = (
            "Focus on progressive overload with compound lifts (squats, deadlifts, bench press, overhead press). "
            "Use a push/pull/legs or upper/lower split. "
            "Hypertrophy rep ranges (8-12 reps) with heavier compound sets (4-6 reps). "
            "Include isolation exercises for lagging muscle groups."
        )

    return f"""Create a highly personalized 7-day fitness and nutrition plan.

USER PROFILE:
- Goal: {goal_text}
- Gender: {req.gender}, Age: {req.age} years, Height: {req.height_cm} cm
- Current weight: {req.current_weight} {req.weight_unit}
- Target weight: {req.target_weight} {req.weight_unit} ({delta:.1f} {req.weight_unit} to {goal_text.split()[0]})
- Timeline: {req.timeline_weeks} weeks
- Activity level: {req.activity_level.replace('_', ' ')}

SCIENTIFICALLY CALCULATED TARGETS (USE EXACTLY):
- BMR (Mifflin-St Jeor): {metrics.bmr} kcal
- TDEE: {metrics.tdee} kcal
- Daily calorie target: {metrics.daily_calories} kcal
- {"Caloric deficit" if req.goal == "lose_weight" else "Caloric surplus"}: {abs(metrics.deficit_or_surplus)} kcal/day
- Safe weekly rate: {metrics.weekly_weight_change_kg} kg/week
- Macros: Protein {metrics.protein_g}g | Carbs {metrics.carbs_g}g | Fat {metrics.fat_g}g

PER-MEAL CALORIE GUIDE:
- Breakfast: ~{breakfast_cal} kcal
- Lunch: ~{lunch_cal} kcal
- Dinner: ~{dinner_cal} kcal
- Snack: ~{snack_cal} kcal
- Per meal macros approx: {meal_protein}g protein, {meal_carbs}g carbs, {meal_fat}g fat

STRICT RULES:
1. Each day's total calories MUST equal {metrics.daily_calories} kcal (+/- 20 kcal).
2. Each day's macros MUST match: protein {metrics.protein_g}g (+/-5g), carbs {metrics.carbs_g}g (+/-10g), fat {metrics.fat_g}g (+/-5g).
3. VERIFY each meal: calories = (protein * 4) + (carbs * 4) + (fat * 9). They MUST match within 10 kcal.
4. Use REAL portion sizes and common foods. Include exact ingredients with realistic amounts.
5. VARY meals across days — no copy-paste days. Different proteins, vegetables, and grains each day.
6. Sunday is a REST day (no exercises, just active recovery like walking).
7. Each workout day must have 5-6 exercises with VARIED sets (3-4), reps (specific to exercise), and rest periods (45-90s).

WORKOUT REQUIREMENTS:
{workout_focus}
- Vary workout duration: 35-55 minutes depending on the day.
- Use specific rep counts, not generic "12" for everything.

MEAL REQUIREMENTS:
- Use whole, real foods (no generic "protein shake" as a main meal).
- Include specific ingredients: "150g chicken breast" not just "chicken".
- Vary protein sources: chicken, fish, eggs, turkey, beef, tofu, legumes.
- Each snack should be a real food (not supplements).

SUMMARY REQUIREMENTS:
The summary must be personalized and specific. Include:
- Current weight ({req.current_weight} {req.weight_unit}) and target ({req.target_weight} {req.weight_unit})
- Exact calorie target ({metrics.daily_calories} kcal/day)
- The {"deficit" if req.goal == "lose_weight" else "surplus"} amount ({abs(metrics.deficit_or_surplus)} kcal)
- Timeline ({req.timeline_weeks} weeks)
- Expected weekly progress ({metrics.weekly_weight_change_kg} kg/week)

Respond ONLY with valid JSON:
{{
  "summary": "Personalized 2-3 sentence summary with all the specific numbers mentioned above",
  "dailyCalorieTarget": {metrics.daily_calories},
  "workoutPlan": [
    {{
      "day": "Monday",
      "exercises": [
        {{ "name": "Barbell Back Squat", "sets": 4, "reps": "8", "restSeconds": 90 }},
        {{ "name": "Romanian Deadlift", "sets": 3, "reps": "10", "restSeconds": 75 }}
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
          "name": "Spinach & Feta Egg White Omelette",
          "calories": {breakfast_cal},
          "protein": {meal_protein},
          "carbs": {meal_carbs},
          "fat": {meal_fat},
          "ingredients": ["4 egg whites", "30g feta cheese", "50g spinach", "1 slice whole grain toast"]
        }}
      ],
      "totalCalories": {metrics.daily_calories}
    }}
  ],
  "supplementRecommendations": ["Creatine Monohydrate (5g/day)", "Vitamin D3 (2000 IU/day)"]
}}

Include all 7 days (Monday-Sunday). Each day: 4 meals. 5-6 exercises per workout day. 4-5 specific supplement recommendations with dosages."""


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
                "content": (
                    "You are a certified fitness coach and registered dietitian with 15 years of experience. "
                    "You create precise, science-based fitness plans. "
                    "You MUST use the exact calorie and macro targets provided — these are calculated using "
                    "the Mifflin-St Jeor equation and are non-negotiable. "
                    "ALWAYS verify that each meal's calories = (protein*4 + carbs*4 + fat*9) before including it. "
                    "Use real foods with specific portions. Never repeat the same meal across different days. "
                    "Respond ONLY with valid JSON, no markdown or code blocks."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.6,
        max_tokens=8192,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("No response from AI")

    plan = json.loads(content)

    # --- Post-process: enforce calorie consistency ---
    plan["dailyCalorieTarget"] = metrics.daily_calories

    for meal_day in plan.get("mealPlan", []):
        meals = meal_day.get("meals", [])

        # Recalculate each meal's calories from macros
        for meal in meals:
            p = meal.get("protein", 0)
            c = meal.get("carbs", 0)
            f = meal.get("fat", 0)
            calculated_cal = p * 4 + c * 4 + f * 9
            meal["calories"] = calculated_cal

        # Update day total
        total = sum(m.get("calories", 0) for m in meals)
        meal_day["totalCalories"] = total

    # --- Normalize supplement recommendations to strings ---
    supps = plan.get("supplementRecommendations", [])
    normalized = []
    for s in supps:
        if isinstance(s, dict):
            name = s.get("name", "")
            dosage = s.get("dosage", "")
            normalized.append(f"{name} ({dosage})" if dosage else name)
        elif isinstance(s, str):
            normalized.append(s)
    plan["supplementRecommendations"] = normalized

    return plan

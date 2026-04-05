import asyncio
import json

from openai import AsyncOpenAI

from models.request import GeneratePlanRequest
from models.response import CalculatedMetrics


def _build_constrained_prompt(req: GeneratePlanRequest, metrics: CalculatedMetrics) -> str:
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


def _generate_fallback_plan(req: GeneratePlanRequest, metrics: CalculatedMetrics) -> dict:
    """Generate a realistic plan using calculated metrics when OpenAI is unavailable."""
    goal_text = "lose weight" if req.goal == "lose_weight" else "gain weight"
    delta = abs(req.current_weight - req.target_weight)

    breakfast_cal = round(metrics.daily_calories * 0.25)
    lunch_cal = round(metrics.daily_calories * 0.30)
    dinner_cal = round(metrics.daily_calories * 0.30)
    snack_cal = metrics.daily_calories - breakfast_cal - lunch_cal - dinner_cal

    mp = metrics.protein_g // 4
    mc = metrics.carbs_g // 4
    mf = metrics.fat_g // 4

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    breakfasts = [
        {"name": "Spinach & Feta Egg White Omelette", "ingredients": ["4 egg whites", "30g feta cheese", "50g spinach", "1 slice whole grain toast"]},
        {"name": "Greek Yogurt Parfait with Berries", "ingredients": ["200g Greek yogurt", "100g mixed berries", "30g granola", "1 tbsp honey"]},
        {"name": "Oatmeal with Banana & Almonds", "ingredients": ["60g rolled oats", "1 banana", "15g almonds", "200ml almond milk"]},
        {"name": "Avocado Toast with Poached Eggs", "ingredients": ["2 eggs", "1/2 avocado", "2 slices whole grain bread", "Cherry tomatoes"]},
        {"name": "Protein Pancakes with Blueberries", "ingredients": ["1 scoop whey protein", "1 banana", "2 egg whites", "50g blueberries"]},
        {"name": "Scrambled Eggs with Smoked Salmon", "ingredients": ["3 eggs", "50g smoked salmon", "1 slice rye bread", "Fresh dill"]},
        {"name": "Overnight Chia Pudding", "ingredients": ["30g chia seeds", "200ml coconut milk", "1 tbsp maple syrup", "100g mango"]},
    ]

    lunches = [
        {"name": "Grilled Chicken Caesar Salad", "ingredients": ["150g chicken breast", "Romaine lettuce", "30g parmesan", "Caesar dressing"]},
        {"name": "Turkey & Quinoa Bowl", "ingredients": ["130g ground turkey", "80g quinoa", "Mixed vegetables", "Tahini dressing"]},
        {"name": "Tuna Poke Bowl", "ingredients": ["140g fresh tuna", "100g sushi rice", "Edamame", "Soy sauce", "Avocado"]},
        {"name": "Chicken Stir-Fry with Brown Rice", "ingredients": ["150g chicken thigh", "Mixed bell peppers", "Broccoli", "80g brown rice"]},
        {"name": "Mediterranean Lentil Salad", "ingredients": ["100g cooked lentils", "Cherry tomatoes", "Cucumber", "50g feta", "Olive oil"]},
        {"name": "Beef & Sweet Potato Bowl", "ingredients": ["130g lean beef strips", "150g sweet potato", "Spinach", "Balsamic glaze"]},
        {"name": "Salmon Grain Bowl", "ingredients": ["140g salmon fillet", "80g farro", "Roasted vegetables", "Lemon dressing"]},
    ]

    dinners = [
        {"name": "Baked Salmon with Asparagus", "ingredients": ["150g salmon fillet", "150g asparagus", "80g sweet potato", "Lemon butter"]},
        {"name": "Lean Beef Stir-Fry with Vegetables", "ingredients": ["140g beef sirloin", "Mixed vegetables", "Soy sauce", "80g jasmine rice"]},
        {"name": "Grilled Chicken with Roasted Vegetables", "ingredients": ["150g chicken breast", "200g mixed roasted vegetables", "Olive oil", "Herbs"]},
        {"name": "Turkey Meatballs with Zucchini Noodles", "ingredients": ["140g ground turkey", "Zucchini noodles", "Marinara sauce", "Parmesan"]},
        {"name": "Cod with Quinoa & Steamed Broccoli", "ingredients": ["160g cod fillet", "80g quinoa", "150g broccoli", "Lemon herb sauce"]},
        {"name": "Chicken Fajita Bowl", "ingredients": ["150g chicken breast", "Bell peppers", "Onions", "80g brown rice", "Salsa"]},
        {"name": "Tofu & Vegetable Curry with Rice", "ingredients": ["150g firm tofu", "Coconut curry sauce", "Mixed vegetables", "80g basmati rice"]},
    ]

    snacks = [
        {"name": "Apple with Almond Butter", "ingredients": ["1 medium apple", "20g almond butter"]},
        {"name": "Mixed Nuts & Dark Chocolate", "ingredients": ["25g mixed nuts", "15g dark chocolate (85%)"]},
        {"name": "Cottage Cheese with Pineapple", "ingredients": ["150g cottage cheese", "80g pineapple chunks"]},
        {"name": "Hummus with Carrot Sticks", "ingredients": ["60g hummus", "150g carrot sticks"]},
        {"name": "Protein Bar & Banana", "ingredients": ["1 protein bar", "1 small banana"]},
        {"name": "Rice Cakes with Peanut Butter", "ingredients": ["2 rice cakes", "20g peanut butter"]},
        {"name": "Trail Mix", "ingredients": ["20g almonds", "15g cashews", "20g dried cranberries"]},
    ]

    workout_templates = [
        {  # Monday - Chest & Triceps
            "exercises": [
                {"name": "Barbell Bench Press", "sets": 4, "reps": "8", "restSeconds": 90},
                {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10", "restSeconds": 75},
                {"name": "Cable Chest Flyes", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Tricep Rope Pushdowns", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Overhead Tricep Extension", "sets": 3, "reps": "10", "restSeconds": 60},
                {"name": "Push-Ups", "sets": 3, "reps": "15", "restSeconds": 45},
            ],
            "durationMinutes": 50,
        },
        {  # Tuesday - Back & Biceps
            "exercises": [
                {"name": "Barbell Bent-Over Row", "sets": 4, "reps": "8", "restSeconds": 90},
                {"name": "Lat Pulldown", "sets": 3, "reps": "10", "restSeconds": 75},
                {"name": "Seated Cable Row", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Face Pulls", "sets": 3, "reps": "15", "restSeconds": 45},
                {"name": "Barbell Bicep Curls", "sets": 3, "reps": "10", "restSeconds": 60},
                {"name": "Hammer Curls", "sets": 3, "reps": "12", "restSeconds": 45},
            ],
            "durationMinutes": 48,
        },
        {  # Wednesday - Legs
            "exercises": [
                {"name": "Barbell Back Squat", "sets": 4, "reps": "6", "restSeconds": 90},
                {"name": "Romanian Deadlift", "sets": 3, "reps": "10", "restSeconds": 75},
                {"name": "Leg Press", "sets": 3, "reps": "12", "restSeconds": 75},
                {"name": "Walking Lunges", "sets": 3, "reps": "12 each", "restSeconds": 60},
                {"name": "Leg Curls", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Calf Raises", "sets": 4, "reps": "15", "restSeconds": 45},
            ],
            "durationMinutes": 55,
        },
        {  # Thursday - Shoulders & Core
            "exercises": [
                {"name": "Overhead Press", "sets": 4, "reps": "8", "restSeconds": 90},
                {"name": "Dumbbell Lateral Raises", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Rear Delt Flyes", "sets": 3, "reps": "15", "restSeconds": 45},
                {"name": "Arnold Press", "sets": 3, "reps": "10", "restSeconds": 75},
                {"name": "Plank Hold", "sets": 3, "reps": "45 sec", "restSeconds": 45},
                {"name": "Cable Woodchops", "sets": 3, "reps": "12 each", "restSeconds": 60},
            ],
            "durationMinutes": 45,
        },
        {  # Friday - Full Body
            "exercises": [
                {"name": "Deadlift", "sets": 4, "reps": "5", "restSeconds": 90},
                {"name": "Dumbbell Bench Press", "sets": 3, "reps": "10", "restSeconds": 75},
                {"name": "Pull-Ups", "sets": 3, "reps": "8", "restSeconds": 75},
                {"name": "Bulgarian Split Squats", "sets": 3, "reps": "10 each", "restSeconds": 60},
                {"name": "Dumbbell Rows", "sets": 3, "reps": "10", "restSeconds": 60},
                {"name": "Ab Rollouts", "sets": 3, "reps": "10", "restSeconds": 45},
            ],
            "durationMinutes": 52,
        },
        {  # Saturday - HIIT & Cardio
            "exercises": [
                {"name": "Box Jumps", "sets": 4, "reps": "10", "restSeconds": 60},
                {"name": "Kettlebell Swings", "sets": 3, "reps": "15", "restSeconds": 45},
                {"name": "Battle Ropes", "sets": 3, "reps": "30 sec", "restSeconds": 45},
                {"name": "Burpees", "sets": 3, "reps": "12", "restSeconds": 60},
                {"name": "Mountain Climbers", "sets": 3, "reps": "20 each", "restSeconds": 45},
                {"name": "Rowing Machine Intervals", "sets": 4, "reps": "250m", "restSeconds": 60},
            ],
            "durationMinutes": 40,
        },
        {  # Sunday - Rest
            "exercises": [],
            "durationMinutes": 0,
        },
    ]

    # Build meal plan
    meal_plan = []
    for i, day in enumerate(days):
        b = breakfasts[i]
        l = lunches[i]
        d = dinners[i]
        s = snacks[i]

        b_protein = mp
        b_carbs = mc
        b_fat = mf
        b_cal = b_protein * 4 + b_carbs * 4 + b_fat * 9

        l_protein = mp + 5
        l_carbs = mc + 5
        l_fat = mf
        l_cal = l_protein * 4 + l_carbs * 4 + l_fat * 9

        d_protein = mp + 5
        d_carbs = mc
        d_fat = mf + 2
        d_cal = d_protein * 4 + d_carbs * 4 + d_fat * 9

        used = b_cal + l_cal + d_cal
        s_cal = max(metrics.daily_calories - used, 100)
        s_protein = max(mp - 5, 5)
        s_carbs = max(mc - 5, 5)
        s_fat = max(round((s_cal - s_protein * 4 - s_carbs * 4) / 9), 3)
        s_cal = s_protein * 4 + s_carbs * 4 + s_fat * 9

        total = b_cal + l_cal + d_cal + s_cal

        meal_plan.append({
            "day": day,
            "meals": [
                {"type": "breakfast", "name": b["name"], "calories": b_cal, "protein": b_protein, "carbs": b_carbs, "fat": b_fat, "ingredients": b["ingredients"]},
                {"type": "lunch", "name": l["name"], "calories": l_cal, "protein": l_protein, "carbs": l_carbs, "fat": l_fat, "ingredients": l["ingredients"]},
                {"type": "dinner", "name": d["name"], "calories": d_cal, "protein": d_protein, "carbs": d_carbs, "fat": d_fat, "ingredients": d["ingredients"]},
                {"type": "snack", "name": s["name"], "calories": s_cal, "protein": s_protein, "carbs": s_carbs, "fat": s_fat, "ingredients": s["ingredients"]},
            ],
            "totalCalories": total,
        })

    # Build workout plan
    workout_plan = []
    for i, day in enumerate(days):
        wt = workout_templates[i]
        workout_plan.append({
            "day": day,
            "exercises": wt["exercises"],
            "durationMinutes": wt["durationMinutes"],
        })

    summary = (
        f"Your personalized plan to {goal_text} from {req.current_weight}{req.weight_unit} to "
        f"{req.target_weight}{req.weight_unit} over {req.timeline_weeks} weeks. "
        f"Daily target: {metrics.daily_calories} kcal with a "
        f"{'deficit' if req.goal == 'lose_weight' else 'surplus'} of {abs(metrics.deficit_or_surplus)} kcal/day, "
        f"aiming for {metrics.weekly_weight_change_kg} kg/week. "
        f"Macros: {metrics.protein_g}g protein, {metrics.carbs_g}g carbs, {metrics.fat_g}g fat."
    )

    return {
        "summary": summary,
        "dailyCalorieTarget": metrics.daily_calories,
        "workoutPlan": workout_plan,
        "mealPlan": meal_plan,
        "supplementRecommendations": [
            "Creatine Monohydrate (5g/day)",
            "Vitamin D3 (2000 IU/day)",
            "Omega-3 Fish Oil (1000mg EPA+DHA/day)",
            "Magnesium Glycinate (400mg before bed)",
            "Whey Protein Isolate (25g post-workout)",
        ],
    }


async def generate_ai_plan(
    api_key: str, req: GeneratePlanRequest, metrics: CalculatedMetrics
) -> dict:
    # Try OpenAI if we have a valid key
    # Set USE_AI=true in .env to enable OpenAI (disabled by default for faster dev)
    import os
    use_ai = os.getenv("USE_AI", "false").lower() == "true"
    if use_ai and api_key and not api_key.startswith("sk-proj-placeholder"):
        import httpx

        try:
            http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=3.0)
            )
            client = AsyncOpenAI(
                api_key=api_key,
                http_client=http_client,
                max_retries=0,  # No retries — fail fast
            )
            prompt = _build_constrained_prompt(req, metrics)

            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a certified fitness coach and registered dietitian. "
                                "Create precise, science-based fitness plans. "
                                "Use the exact calorie and macro targets provided. "
                                "Respond ONLY with valid JSON, no markdown or code blocks."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.6,
                    max_tokens=8192,
                    response_format={"type": "json_object"},
                ),
                timeout=10.0,
            )
            await http_client.aclose()
        except Exception as e:
            print(f"⚠️ OpenAI failed ({type(e).__name__}: {e}), using fallback")
            try:
                await http_client.aclose()
            except Exception:
                pass
            return _generate_fallback_plan(req, metrics)
    else:
        print("⚠️ No valid OpenAI key, using fallback plan")
        return _generate_fallback_plan(req, metrics)

    content = response.choices[0].message.content
    if not content:
        print("⚠️ Empty AI response, using fallback plan")
        return _generate_fallback_plan(req, metrics)

    try:
        plan = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"⚠️ AI returned invalid JSON ({e}), using fallback plan")
        return _generate_fallback_plan(req, metrics)

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

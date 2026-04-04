from models.request import GeneratePlanRequest
from models.response import CalculatedMetrics

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "lightly_active": 1.375,
    "moderately_active": 1.55,
    "very_active": 1.725,
    "extra_active": 1.9,
}

# 1 kg of body fat/muscle ≈ 7700 kcal
KCAL_PER_KG = 7700


def _to_kg(weight: float, unit: str) -> float:
    return weight if unit == "kg" else weight * 0.453592


def calculate_fitness_metrics(req: GeneratePlanRequest) -> CalculatedMetrics:
    weight_kg = _to_kg(req.current_weight, req.weight_unit)
    target_kg = _to_kg(req.target_weight, req.weight_unit)

    # --- BMR using Mifflin-St Jeor equation ---
    bmr = 10 * weight_kg + 6.25 * req.height_cm - 5 * req.age
    if req.gender == "male":
        bmr += 5
    else:
        bmr -= 161
    bmr = round(bmr)

    # --- TDEE ---
    multiplier = ACTIVITY_MULTIPLIERS[req.activity_level]
    tdee = round(bmr * multiplier)

    # --- Weekly weight change rate ---
    total_change_kg = abs(target_kg - weight_kg)
    weekly_rate = total_change_kg / max(req.timeline_weeks, 1)
    weekly_rate = round(weekly_rate, 2)

    # --- Daily caloric deficit or surplus ---
    daily_adjustment = round((weekly_rate * KCAL_PER_KG) / 7)

    if req.goal == "lose_weight":
        daily_calories = tdee - daily_adjustment
        deficit_or_surplus = -daily_adjustment
        # safety floor
        floor = 1500 if req.gender == "male" else 1200
        daily_calories = max(daily_calories, floor)
    else:
        daily_calories = tdee + daily_adjustment
        deficit_or_surplus = daily_adjustment
        # cap surplus to avoid extreme bulking
        daily_calories = min(daily_calories, tdee + 1000)

    # --- Macro split ---
    if req.goal == "lose_weight":
        protein_pct, carbs_pct, fat_pct = 0.40, 0.30, 0.30
    else:
        protein_pct, carbs_pct, fat_pct = 0.30, 0.45, 0.25

    protein_g = round((daily_calories * protein_pct) / 4)
    carbs_g = round((daily_calories * carbs_pct) / 4)
    fat_g = round((daily_calories * fat_pct) / 9)

    return CalculatedMetrics(
        bmr=bmr,
        tdee=tdee,
        daily_calories=daily_calories,
        protein_g=protein_g,
        carbs_g=carbs_g,
        fat_g=fat_g,
        weekly_weight_change_kg=weekly_rate,
        deficit_or_surplus=deficit_or_surplus,
    )

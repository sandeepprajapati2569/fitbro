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

# Safe maximum deficit: no more than 25% below TDEE
MAX_DEFICIT_PCT = 0.25

# Safe maximum weekly loss/gain rates
MAX_SAFE_LOSS_KG_PER_WEEK = 1.0
MAX_SAFE_GAIN_KG_PER_WEEK = 0.5


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

    # --- Cap weekly rate to safe limits ---
    if req.goal == "lose_weight":
        weekly_rate = min(weekly_rate, MAX_SAFE_LOSS_KG_PER_WEEK)
    else:
        weekly_rate = min(weekly_rate, MAX_SAFE_GAIN_KG_PER_WEEK)

    # --- Daily caloric deficit or surplus ---
    daily_adjustment = round((weekly_rate * KCAL_PER_KG) / 7)

    if req.goal == "lose_weight":
        # Never exceed 25% deficit below TDEE (medically recommended max)
        max_deficit = round(tdee * MAX_DEFICIT_PCT)
        daily_adjustment = min(daily_adjustment, max_deficit)

        daily_calories = tdee - daily_adjustment
        deficit_or_surplus = -daily_adjustment

        # Absolute safety floor: never below BMR
        absolute_floor = max(bmr, 1200 if req.gender == "female" else 1400)
        daily_calories = max(daily_calories, absolute_floor)

        # Recalculate actual deficit after floor applied
        deficit_or_surplus = -(tdee - daily_calories)

        # Recalculate actual weekly rate based on final calories
        actual_daily_deficit = tdee - daily_calories
        weekly_rate = round((actual_daily_deficit * 7) / KCAL_PER_KG, 2)
        weekly_rate = max(weekly_rate, 0.0)  # can't be negative

    else:
        # For gaining: cap surplus at 500 kcal/day (lean bulk)
        daily_adjustment = min(daily_adjustment, 500)

        daily_calories = tdee + daily_adjustment
        deficit_or_surplus = daily_adjustment

        # Recalculate actual weekly rate
        weekly_rate = round((daily_adjustment * 7) / KCAL_PER_KG, 2)

    # --- Macro split based on goal and body weight ---
    if req.goal == "lose_weight":
        # High protein to preserve muscle during cut
        # Protein: 2.0g per kg body weight (capped by calorie budget)
        protein_g = round(min(weight_kg * 2.0, daily_calories * 0.40 / 4))
        # Fat: 25% of calories (minimum for hormonal health)
        fat_g = round((daily_calories * 0.25) / 9)
        # Carbs: remaining calories
        remaining_cal = daily_calories - (protein_g * 4) - (fat_g * 9)
        carbs_g = round(max(remaining_cal, 0) / 4)
    else:
        # Moderate protein for muscle growth
        # Protein: 1.8g per kg body weight
        protein_g = round(min(weight_kg * 1.8, daily_calories * 0.30 / 4))
        # Fat: 25% of calories
        fat_g = round((daily_calories * 0.25) / 9)
        # Carbs: remaining calories (fuel for workouts)
        remaining_cal = daily_calories - (protein_g * 4) - (fat_g * 9)
        carbs_g = round(max(remaining_cal, 0) / 4)

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

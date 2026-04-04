from fastapi import APIRouter, HTTPException, Request
from models.request import GeneratePlanRequest
from models.response import PlanResponse, PlanSummary
from services.fitness_calculator import calculate_fitness_metrics
from services.ai_orchestrator import generate_ai_plan
from services.plan_store import save_plan, get_plan, list_plans

router = APIRouter(prefix="/api", tags=["plans"])


@router.post("/generate-plan", response_model=PlanResponse)
async def create_plan(body: GeneratePlanRequest, request: Request):
    settings = request.app.state.settings
    supabase = request.app.state.supabase

    # 1. Calculate real fitness metrics
    metrics = calculate_fitness_metrics(body)

    # 2. Generate AI plan constrained by calculated metrics
    try:
        plan_data = await generate_ai_plan(
            settings.OPENAI_API_KEY, body, metrics
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")

    # 3. Save to Supabase (if available)
    plan_id = "local-" + str(abs(hash(str(plan_data))))[:8]
    if supabase:
        try:
            plan_id = await save_plan(
                supabase,
                body.model_dump(),
                metrics.model_dump(),
                plan_data,
            )
        except Exception as e:
            print(f"Supabase save failed: {e}")

    # 4. Build response
    return PlanResponse(
        id=plan_id,
        calculated=metrics,
        summary=plan_data.get("summary", ""),
        dailyCalorieTarget=metrics.daily_calories,
        workoutPlan=plan_data.get("workoutPlan", []),
        mealPlan=plan_data.get("mealPlan", []),
        supplementRecommendations=plan_data.get("supplementRecommendations", []),
    )


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def retrieve_plan(plan_id: str, request: Request):
    supabase = request.app.state.supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")
    row = await get_plan(supabase, plan_id)
    if not row:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan_data = row["plan_data"]
    metrics = row["calculated_metrics"]

    return PlanResponse(
        id=row["id"],
        calculated=metrics,
        summary=plan_data.get("summary", ""),
        dailyCalorieTarget=metrics["daily_calories"],
        workoutPlan=plan_data.get("workoutPlan", []),
        mealPlan=plan_data.get("mealPlan", []),
        supplementRecommendations=plan_data.get("supplementRecommendations", []),
    )


@router.get("/plans", response_model=list[PlanSummary])
async def get_plans(
    request: Request, limit: int = 20, offset: int = 0
):
    supabase = request.app.state.supabase
    if not supabase:
        return []
    rows = await list_plans(supabase, limit, offset)

    summaries = []
    for row in rows:
        req_data = row.get("request", {})
        calc = row.get("calculated_metrics", {})
        summaries.append(
            PlanSummary(
                id=row["id"],
                created_at=row["created_at"],
                goal=req_data.get("goal", ""),
                daily_calories=calc.get("daily_calories", 0),
                current_weight=req_data.get("current_weight", 0),
                target_weight=req_data.get("target_weight", 0),
                weight_unit=req_data.get("weight_unit", "kg"),
                timeline_weeks=req_data.get("timeline_weeks", 0),
            )
        )
    return summaries

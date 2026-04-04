import uuid
from datetime import datetime, timezone
from supabase import AsyncClient


async def save_plan(
    supabase: AsyncClient,
    request_data: dict,
    calculated_metrics: dict,
    plan_data: dict,
) -> str:
    plan_id = str(uuid.uuid4())
    row = {
        "id": plan_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "request": request_data,
        "calculated_metrics": calculated_metrics,
        "plan_data": plan_data,
    }
    await supabase.table("plans").insert(row).execute()
    return plan_id


async def get_plan(supabase: AsyncClient, plan_id: str) -> dict | None:
    result = (
        await supabase.table("plans").select("*").eq("id", plan_id).execute()
    )
    if result.data:
        return result.data[0]
    return None


async def list_plans(
    supabase: AsyncClient, limit: int = 20, offset: int = 0
) -> list[dict]:
    result = (
        await supabase.table("plans")
        .select("id, created_at, request, calculated_metrics")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or []

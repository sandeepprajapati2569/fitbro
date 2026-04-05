from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routes.plans import router as plans_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.settings = settings
    # Supabase is optional — works without it
    app.state.supabase = None
    if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
        try:
            from supabase import acreate_client

            app.state.supabase = await acreate_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            print("✅ Supabase connected")
        except Exception as e:
            print(f"⚠️ Supabase not available: {e}")
    else:
        print("⚠️ Supabase not configured — running without persistence")
    yield


app = FastAPI(title="FitGoal API", version="1.0.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plans_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time

from src.config import settings
from src.api.v1.router import api_router
from src.database.supabase import init_supabase

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(">> Starting up Jira Lite API...")
    init_supabase()
    print(">> Supabase initialized")
    yield
    # Shutdown
    print(">> Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": str(exc)}
    )

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Jira Lite API",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)

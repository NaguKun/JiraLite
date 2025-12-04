from fastapi import APIRouter
from src.api.v1.endpoints import (
    auth,
    users,
    teams,
    projects,
    issues,
    comments,
    notifications,
    dashboard,
    ai
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(issues.router, prefix="/issues", tags=["Issues"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Features"])

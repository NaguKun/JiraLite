from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import AIGenerateResponse
from src.database.supabase import get_supabase
from src.api.dependencies import get_current_user, verify_issue_access
from src.services.ai_service import AIService
from uuid import UUID

router = APIRouter()
ai_service = AIService()

@router.post("/issues/{issue_id}/summary", response_model=AIGenerateResponse)
async def generate_summary(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-040: AI Summary Generation
    """
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        # Check rate limit
        await ai_service.check_rate_limit(current_user["id"])

        # Get issue
        issue = supabase.table("issues").select("*").eq(
            "id", str(issue_id)
        ).single().execute()

        # Check description length
        if not issue.data.get("description") or len(issue.data["description"]) <= 10:
            raise HTTPException(
                status_code=400,
                detail="Issue description must be more than 10 characters"
            )

        # Check if cached
        if issue.data.get("ai_summary") and issue.data.get("ai_summary_cached_at"):
            return {
                "result": issue.data["ai_summary"],
                "cached": True
            }

        # Generate summary
        summary = await ai_service.generate_summary(issue.data["description"])

        # Cache result
        supabase.table("issues").update({
            "ai_summary": summary,
            "ai_summary_cached_at": "now()"
        }).eq("id", str(issue_id)).execute()

        # Increment rate limit counter
        await ai_service.increment_rate_limit(current_user["id"])

        return {
            "result": summary,
            "cached": False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/issues/{issue_id}/suggestion", response_model=AIGenerateResponse)
async def generate_suggestion(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-041: AI Solution Suggestion
    """
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        # Check rate limit
        await ai_service.check_rate_limit(current_user["id"])

        # Get issue
        issue = supabase.table("issues").select("*").eq(
            "id", str(issue_id)
        ).single().execute()

        # Check description length
        if not issue.data.get("description") or len(issue.data["description"]) <= 10:
            raise HTTPException(
                status_code=400,
                detail="Issue description must be more than 10 characters"
            )

        # Check if cached
        if issue.data.get("ai_suggestion") and issue.data.get("ai_suggestion_cached_at"):
            return {
                "result": issue.data["ai_suggestion"],
                "cached": True
            }

        # Generate suggestion
        suggestion = await ai_service.generate_suggestion(
            issue.data["title"],
            issue.data["description"]
        )

        # Cache result
        supabase.table("issues").update({
            "ai_suggestion": suggestion,
            "ai_suggestion_cached_at": "now()"
        }).eq("id", str(issue_id)).execute()

        # Increment rate limit counter
        await ai_service.increment_rate_limit(current_user["id"])

        return {
            "result": suggestion,
            "cached": False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/issues/{issue_id}/labels/suggest")
async def suggest_labels(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-043: AI Auto-Label
    """
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        # Check rate limit
        await ai_service.check_rate_limit(current_user["id"])

        # Get issue with project labels
        issue = supabase.table("issues").select(
            "*, projects!inner(id)"
        ).eq("id", str(issue_id)).single().execute()

        project_id = issue.data["project_id"]

        # Get available labels
        labels = supabase.table("labels").select("*").eq(
            "project_id", project_id
        ).execute()

        if not labels.data:
            return {"recommended_labels": []}

        # Generate recommendations
        recommended = await ai_service.recommend_labels(
            issue.data["title"],
            issue.data.get("description", ""),
            labels.data
        )

        # Increment rate limit counter
        await ai_service.increment_rate_limit(current_user["id"])

        return {"recommended_labels": recommended}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/issues/detect-duplicates")
async def detect_duplicates(
    project_id: UUID,
    title: str,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-044: AI Duplicate Detection
    """
    try:
        supabase = get_supabase()

        # Check rate limit
        await ai_service.check_rate_limit(current_user["id"])

        # Get existing issues
        issues = supabase.table("issues").select("id, title, description").eq(
            "project_id", str(project_id)
        ).is_("deleted_at", "null").execute()

        # Find similar issues
        similar = await ai_service.detect_duplicates(title, issues.data)

        # Increment rate limit counter
        await ai_service.increment_rate_limit(current_user["id"])

        return {"similar_issues": similar}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/issues/{issue_id}/comments/summarize", response_model=AIGenerateResponse)
async def summarize_comments(
    issue_id: UUID,
    current_user: dict = Depends(get_current_user)
):
    """
    FR-045: AI Comment Summary
    """
    try:
        await verify_issue_access(issue_id, current_user)
        supabase = get_supabase()

        # Check rate limit
        await ai_service.check_rate_limit(current_user["id"])

        # Get comments
        comments = supabase.table("comments").select("*").eq(
            "issue_id", str(issue_id)
        ).is_("deleted_at", "null").execute()

        if len(comments.data) < 5:
            raise HTTPException(
                status_code=400,
                detail="At least 5 comments required for summarization"
            )

        # Generate summary
        summary = await ai_service.summarize_comments(comments.data)

        # Increment rate limit counter
        await ai_service.increment_rate_limit(current_user["id"])

        return {
            "result": summary,
            "cached": False
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from src.config import settings
from src.database.supabase import get_supabase
from datetime import datetime, timedelta
from fastapi import HTTPException
import openai
from typing import List, Dict
import json

class AIService:
    def __init__(self):
        self.use_openai = bool(settings.OPENAI_API_KEY)
        self.use_anthropic = bool(settings.ANTHROPIC_API_KEY)

        if self.use_openai:
            openai.api_key = settings.OPENAI_API_KEY
        elif self.use_anthropic:
            try:
                import anthropic
                self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except ImportError:
                print("Warning: anthropic package not installed")

    async def check_rate_limit(self, user_id: str):
        """
        FR-042: AI Rate Limiting
        Check if user has exceeded rate limit (10 per minute or 100 per day)
        """
        supabase = get_supabase()

        # Check per-minute limit
        minute_start = datetime.utcnow().replace(second=0, microsecond=0)
        minute_record = supabase.table("ai_rate_limits").select("*").eq(
            "user_id", user_id
        ).eq("window_type", "minute").eq(
            "window_start", minute_start.isoformat()
        ).execute()

        if minute_record.data and minute_record.data[0]["request_count"] >= 10:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded: 10 requests per minute. Please try again later."
            )

        # Check per-day limit
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        day_record = supabase.table("ai_rate_limits").select("*").eq(
            "user_id", user_id
        ).eq("window_type", "day").eq(
            "window_start", day_start.isoformat()
        ).execute()

        if day_record.data and day_record.data[0]["request_count"] >= 100:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded: 100 requests per day. Please try again tomorrow."
            )

    async def increment_rate_limit(self, user_id: str):
        """
        Increment rate limit counters
        """
        supabase = get_supabase()

        # Increment minute counter
        minute_start = datetime.utcnow().replace(second=0, microsecond=0)
        minute_record = supabase.table("ai_rate_limits").select("*").eq(
            "user_id", user_id
        ).eq("window_type", "minute").eq(
            "window_start", minute_start.isoformat()
        ).execute()

        if minute_record.data:
            supabase.table("ai_rate_limits").update({
                "request_count": minute_record.data[0]["request_count"] + 1
            }).eq("id", minute_record.data[0]["id"]).execute()
        else:
            supabase.table("ai_rate_limits").insert({
                "user_id": user_id,
                "window_type": "minute",
                "window_start": minute_start.isoformat(),
                "request_count": 1
            }).execute()

        # Increment day counter
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        day_record = supabase.table("ai_rate_limits").select("*").eq(
            "user_id", user_id
        ).eq("window_type", "day").eq(
            "window_start", day_start.isoformat()
        ).execute()

        if day_record.data:
            supabase.table("ai_rate_limits").update({
                "request_count": day_record.data[0]["request_count"] + 1
            }).eq("id", day_record.data[0]["id"]).execute()
        else:
            supabase.table("ai_rate_limits").insert({
                "user_id": user_id,
                "window_type": "day",
                "window_start": day_start.isoformat(),
                "request_count": 1
            }).execute()

    async def _call_llm(self, prompt: str, system_message: str = None) -> str:
        """
        Call LLM API (OpenAI or Anthropic)
        """
        try:
            if self.use_openai:
                messages = []
                if system_message:
                    messages.append({"role": "system", "content": system_message})
                messages.append({"role": "user", "content": prompt})

                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=500
                )

                return response.choices[0].message.content.strip()

            elif self.use_anthropic:
                message = self.anthropic_client.messages.create(
                    model="claude-3-haiku-20240307",
                    max_tokens=500,
                    system=system_message if system_message else "",
                    messages=[{"role": "user", "content": prompt}]
                )

                return message.content[0].text.strip()

            else:
                # Fallback mock response for testing
                return "AI feature not configured. Please add OpenAI or Anthropic API key."

        except Exception as e:
            raise Exception(f"AI API call failed: {str(e)}")

    async def generate_summary(self, description: str) -> str:
        """
        FR-040: AI Summary Generation
        Generate a 2-4 sentence summary of issue description
        """
        prompt = f"""Summarize the following issue description in 2-4 sentences.
Be concise and focus on the main points:

{description}

Summary:"""

        system_message = "You are a helpful assistant that summarizes technical issue descriptions concisely."

        return await self._call_llm(prompt, system_message)

    async def generate_suggestion(self, title: str, description: str) -> str:
        """
        FR-041: AI Solution Suggestion
        Suggest an approach to solve the issue
        """
        prompt = f"""Given this issue, suggest a practical approach to solve it:

Title: {title}

Description: {description}

Provide a clear, actionable solution approach in 3-5 bullet points:"""

        system_message = "You are a helpful technical advisor providing practical solutions to software issues."

        return await self._call_llm(prompt, system_message)

    async def recommend_labels(self, title: str, description: str, available_labels: List[Dict]) -> List[str]:
        """
        FR-043: AI Auto-Label
        Recommend appropriate labels for an issue
        """
        labels_text = ", ".join([f"{label['name']}" for label in available_labels])

        prompt = f"""Based on this issue, recommend up to 3 most relevant labels from the available options:

Title: {title}
Description: {description}

Available labels: {labels_text}

Return ONLY a JSON array of label names, like: ["label1", "label2"]
Do not include any other text."""

        system_message = "You are a label recommendation system. Return only valid JSON arrays."

        try:
            result = await self._call_llm(prompt, system_message)

            # Parse JSON response
            import re
            # Extract JSON array from response
            json_match = re.search(r'\[.*?\]', result)
            if json_match:
                recommended_names = json.loads(json_match.group())

                # Convert names to label IDs
                label_ids = []
                for label in available_labels:
                    if label["name"] in recommended_names:
                        label_ids.append(label["id"])

                return label_ids[:3]  # Max 3 recommendations

            return []

        except Exception as e:
            print(f"Label recommendation error: {str(e)}")
            return []

    async def detect_duplicates(self, title: str, existing_issues: List[Dict]) -> List[Dict]:
        """
        FR-044: AI Duplicate Detection
        Detect similar/duplicate issues
        """
        if not existing_issues:
            return []

        # Simple text similarity for now
        # In production, use embeddings or more sophisticated matching
        similar_issues = []

        title_lower = title.lower()
        words = set(title_lower.split())

        for issue in existing_issues[:50]:  # Check last 50 issues
            issue_title_lower = issue["title"].lower()
            issue_words = set(issue_title_lower.split())

            # Calculate word overlap
            overlap = len(words & issue_words)
            similarity = overlap / max(len(words), len(issue_words)) if words or issue_words else 0

            if similarity > 0.5:  # 50% similarity threshold
                similar_issues.append({
                    "id": issue["id"],
                    "title": issue["title"],
                    "similarity": round(similarity * 100, 2)
                })

        # Return top 3 most similar
        similar_issues.sort(key=lambda x: x["similarity"], reverse=True)
        return similar_issues[:3]

    async def summarize_comments(self, comments: List[Dict]) -> str:
        """
        FR-045: AI Comment Summary
        Summarize discussion in comments
        """
        comment_texts = [f"- {comment['content']}" for comment in comments[:20]]  # Limit to 20 comments
        comments_joined = "\n".join(comment_texts)

        prompt = f"""Summarize the following discussion comments in 3-5 sentences.
Focus on key points, decisions, and action items:

{comments_joined}

Summary:"""

        system_message = "You are a helpful assistant that summarizes discussion threads, highlighting key decisions and action items."

        return await self._call_llm(prompt, system_message)

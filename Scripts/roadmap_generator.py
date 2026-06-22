import os
import json
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
RECOMMENDATIONS_FILE = BASE_DIR / "Reports" / "recommendations.json"
OUTPUT_FILE = BASE_DIR / "Reports" / "roadmap.json"


class WeekPlan(BaseModel):
    week: int = Field(description="Week number")
    theme: str = Field(description="Theme or focus area for the week e.g. Deep Learning Foundations")
    skills: List[str] = Field(description="Skills to learn this week")
    goal: str = Field(description="What the learner will be able to do by end of week")


class LearningRoadmap(BaseModel):
    target_role: str
    total_weeks: int
    summary: str = Field(description="2-3 sentence overview of the roadmap strategy")
    weeks: List[WeekPlan]


def get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in .env file.")
    return genai.Client(api_key=api_key)


def generate_roadmap(client: genai.Client, target_role: str, skills_have: list, missing_skills: dict) -> str:
    # Take top 20 missing skills ordered by frequency for focus
    top_missing = sorted(missing_skills.items(), key=lambda x: x[1], reverse=True)[:20]
    top_missing_names = [skill for skill, _ in top_missing]

    prompt = f"""
You are an expert AI/ML career coach.

A learner wants to become a {target_role}.

Their current skills: {', '.join(skills_have)}

The most in-demand missing skills for {target_role} based on real job market data:
{', '.join(top_missing_names)}

Generate a practical, realistic week-by-week learning roadmap that:
- Starts from their existing foundation
- Builds skills in logical order (fundamentals before advanced)
- Groups related skills into weekly themes
- Is achievable in 6-10 weeks
- Focuses on the highest market-demand skills first

Return a structured roadmap.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=LearningRoadmap,
            temperature=0.3,
            max_output_tokens=8192,
        ),
    )
    return response.text


def main():
    if not RECOMMENDATIONS_FILE.exists():
        print(f"Error: {RECOMMENDATIONS_FILE} not found. Run recommendation_engine.py first.")
        return

    with open(RECOMMENDATIONS_FILE, "r", encoding="utf-8") as f:
        recommendations = json.load(f)

    target_role = recommendations.get("target_role", "AI Engineer")
    skills_have = recommendations.get("skills_you_have", [])
    missing_skills = recommendations.get("high_priority_missing_skills", {})

    if not missing_skills:
        print("No missing skills found. Roadmap not needed.")
        return

    print(f"Generating learning roadmap for: {target_role}")
    print(f"Current skills: {len(skills_have)} | Missing skills to address: {min(20, len(missing_skills))}")

    try:
        client = get_gemini_client()
    except ValueError as e:
        print(e)
        return

    try:
        roadmap_json = generate_roadmap(client, target_role, skills_have, missing_skills)
        roadmap_data = json.loads(roadmap_json)

        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(roadmap_data, f, indent=4, ensure_ascii=False)

        total_weeks = roadmap_data.get("total_weeks", len(roadmap_data.get("weeks", [])))
        print(f"Roadmap generated: {total_weeks} weeks saved to {OUTPUT_FILE.name}")

    except Exception as e:
        print(f"Error generating roadmap: {e}")


if __name__ == "__main__":
    main()

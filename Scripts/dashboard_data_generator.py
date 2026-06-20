import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

TOP_SKILLS_FILE = BASE_DIR / "Reports" / "top_skills.json"
ROLE_ANALYSIS_FILE = BASE_DIR / "Reports" / "role_skill_analysis.json"
RECOMMENDATIONS_FILE = BASE_DIR / "Reports" / "recommendations.json"
SKILL_INSIGHTS_FILE = BASE_DIR / "Reports" / "skill_insights.json"

OUTPUT_FILE = BASE_DIR / "Reports" / "dashboard_data.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():

    top_skills = load_json(TOP_SKILLS_FILE)

    role_analysis = load_json(ROLE_ANALYSIS_FILE)

    recommendations = load_json(RECOMMENDATIONS_FILE)

    skill_insights = load_json(SKILL_INSIGHTS_FILE)

    dashboard_data = {
        "market_overview": {
            "top_skills": top_skills
        },

        "role_analysis": role_analysis,

        "user_recommendations": recommendations,

        "skill_insights": skill_insights
    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            dashboard_data,
            f,
            indent=4
        )

    print("dashboard_data.json generated successfully")


if __name__ == "__main__":
    main()
import json
import os

_SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.realpath(os.path.join(_SCRIPTS_DIR, "..", "Reports"))

ALLOWED_INPUTS = {
    "top_skills.json",
    "role_skill_analysis.json",
    "recommendations.json",
    "skill_insights.json",
}
OUTPUT_FILENAME = "dashboard_data.json"


def load_json(filename: str):
    if filename not in ALLOWED_INPUTS:
        raise ValueError(f"Access denied: '{filename}' is not an allowed input file")
    path = os.path.join(REPORTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    top_skills = load_json("top_skills.json")
    role_analysis = load_json("role_skill_analysis.json")
    recommendations = load_json("recommendations.json")
    skill_insights = load_json("skill_insights.json")

    dashboard_data = {
        "market_overview": {"top_skills": top_skills},
        "role_analysis": role_analysis,
        "user_recommendations": recommendations,
        "skill_insights": skill_insights,
    }

    output_path = os.path.join(REPORTS_DIR, OUTPUT_FILENAME)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dashboard_data, f, indent=4)

    print("dashboard_data.json generated successfully")


if __name__ == "__main__":
    main()
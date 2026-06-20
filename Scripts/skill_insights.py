import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

TOP_SKILLS_FILE = BASE_DIR / "Reports" / "top_skills.json"
ROLE_ANALYSIS_FILE = BASE_DIR / "Reports" / "role_skill_analysis.json"
OUTPUT_FILE = BASE_DIR / "Reports" / "skill_insights.json"


def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_top_n_skills(skill_dict, n=10):
    return list(skill_dict.keys())[:n]


def main():

    top_skills = load_json(TOP_SKILLS_FILE)
    role_analysis = load_json(ROLE_ANALYSIS_FILE)

    insights = {
        "overall_top_10_skills": get_top_n_skills(top_skills, 10),

        "top_ai_engineer_skills":
            get_top_n_skills(
                role_analysis.get("AI Engineer", {}),
                5
            ),

        "top_ml_engineer_skills":
            get_top_n_skills(
                role_analysis.get("ML Engineer", {}),
                5
            ),

        "top_data_scientist_skills":
            get_top_n_skills(
                role_analysis.get("Data Scientist", {}),
                5
            ),

        "top_data_engineer_skills":
            get_top_n_skills(
                role_analysis.get("Data Engineer", {}),
                5
            ),

        "top_software_engineer_skills":
            get_top_n_skills(
                role_analysis.get("Software Engineer", {}),
                5
            )
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            insights,
            f,
            indent=4,
            ensure_ascii=False
        )

    print("skill_insights.json generated successfully")


if __name__ == "__main__":
    main()
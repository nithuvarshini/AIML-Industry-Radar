import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

ROLE_ANALYSIS_FILE = BASE_DIR / "Reports" / "role_skill_analysis.json"
USER_PROFILE_FILE = BASE_DIR / "Input" / "user_profile.json"
OUTPUT_FILE = BASE_DIR / "Reports" / "recommendations.json"


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():

    role_analysis = load_json(ROLE_ANALYSIS_FILE)
    user_profile = load_json(USER_PROFILE_FILE)

    target_role = user_profile["target_role"]

    user_skills = {
        skill.lower()
        for skill in user_profile["skills"]
    }

    role_skills = role_analysis.get(target_role, {})

    missing_skills = {}

    for skill, frequency in role_skills.items():

        if skill.lower() not in user_skills:
            missing_skills[skill] = frequency

    total_role_skills = len(role_skills)

    matched_skills = (
        total_role_skills - len(missing_skills)
    )

    readiness_percentage = round(
        (matched_skills / total_role_skills) * 100,
        2
    )

    recommendations = {
        "target_role": target_role,
        "skills_you_have": user_profile["skills"],
        "skills_you_match": matched_skills,
        "total_role_skills": total_role_skills,
        "role_readiness_percentage": readiness_percentage,
        "high_priority_missing_skills": dict(
            sorted(
                missing_skills.items(),
                key=lambda x: x[1],
                reverse=True
            )
        )
    }

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            recommendations,
            f,
            indent=4
        )

    print("recommendations.json generated successfully")


if __name__ == "__main__":
    main()
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / "Reports"
INPUT_DIR = BASE_DIR / "Input"

ROLE_ANALYSIS_FILE = REPORTS_DIR / "role_skill_analysis.json"
USER_PROFILE_FILE = INPUT_DIR / "user_profile.json"
OUTPUT_FILE = REPORTS_DIR / "recommendations.json"


def _safe_path(path: Path, allowed_dir: Path) -> Path:
    resolved = path.resolve()
    if not str(resolved).startswith(str(allowed_dir.resolve())):
        raise ValueError(f"Access denied: '{resolved}' is outside '{allowed_dir}'")
    return resolved


def load_json(path, allowed_dir: Path):
    safe = _safe_path(path, allowed_dir)
    with open(safe, "r", encoding="utf-8") as f:
        return json.load(f)


def main():

    role_analysis = load_json(ROLE_ANALYSIS_FILE, REPORTS_DIR)
    user_profile = load_json(USER_PROFILE_FILE, INPUT_DIR)

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
    matched_skills = 0
    for skill in role_skills:
        if skill.lower() in user_skills:
            matched_skills += 1
    readiness_percentage = round((matched_skills / total_role_skills) * 100,2) if total_role_skills > 0 else 0

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
        _safe_path(OUTPUT_FILE, REPORTS_DIR),
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
"""
run_pipeline.py

Runs the full AIML Industry Radar pipeline in order:
1. Extract skills from raw jobs
2. Normalize skills
3. Classify roles (AI-based)
4. Aggregate skills
5. Role skill analysis
6. Skill insights
7. Recommendations
8. Roadmap
9. Dashboard data
"""

import subprocess
import sys
import time
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent

PIPELINE = [
    ("Skill Extraction",        "extract_skills.py"),
    ("Skill Normalization",     "normalize_skills.py"),
    ("Role Classification",     "classify_roles.py"),
    ("Skill Aggregation",       "aggregate_skills.py"),
    ("Role Skill Analysis",     "role_skill_analysis.py"),
    ("Skill Insights",          "skill_insights.py"),
    ("Recommendations",         "recommendation_engine.py"),
    ("Learning Roadmap",        "roadmap_generator.py"),
    ("Dashboard Data",          "dashboard_data_generator.py"),
]


def run_step(name: str, script: str) -> bool:
    print(f"\n{'='*50}")
    print(f"  STEP: {name}")
    print(f"{'='*50}")

    result = subprocess.run(
        [sys.executable, str(SCRIPTS_DIR / script)],
        cwd=str(SCRIPTS_DIR)
    )

    if result.returncode != 0:
        print(f"\n[FAILED] {name} exited with error code {result.returncode}")
        return False

    print(f"\n[DONE] {name}")
    return True


def main():
    print("\n" + "=" * 50)
    print("  AIML Industry Radar — Full Pipeline")
    print("=" * 50)

    start = time.time()
    failed = []

    for name, script in PIPELINE:
        success = run_step(name, script)
        if not success:
            failed.append(name)
            print(f"[WARNING] Skipping rest due to failure in: {name}")
            break

    elapsed = round(time.time() - start, 1)

    print("\n" + "=" * 50)
    if not failed:
        print(f"  Pipeline completed successfully in {elapsed}s")
        print("  Restart your backend to serve fresh data.")
    else:
        print(f"  Pipeline failed at: {', '.join(failed)}")
    print("=" * 50)


if __name__ == "__main__":
    main()

import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_JOBS_DIR = BASE_DIR / "Raw_Jobs"
OUTPUT_FILE = BASE_DIR / "role_mapping.json"

VALID_ROLES = [
    "AI Engineer",
    "ML Engineer",
    "Data Scientist",
    "Data Engineer",
    "Software Engineer",
    "GenAI Engineer",
    "LLM Engineer",
    "MLOps Engineer",
    "AI Research Engineer",
]


class JobRole(BaseModel):
    role: str


def get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in .env file.")
    return genai.Client(api_key=api_key)


def classify_job(client: genai.Client, job_text: str) -> str:
    # Truncate to first 1500 chars — enough context, saves tokens
    truncated = job_text[:1500]

    prompt = f"""Classify this job posting into exactly one of these roles:
{', '.join(VALID_ROLES)}

Job Posting:
{truncated}

Return only the role name, nothing else."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=JobRole,
            temperature=0.0,
            max_output_tokens=50,
        ),
    )

    result = json.loads(response.text)
    role = result.get("role", "").strip()

    # Fallback if Gemini returns something unexpected
    if role not in VALID_ROLES:
        role = "AI Engineer"

    return role


def main():
    if not RAW_JOBS_DIR.exists():
        print(f"Error: {RAW_JOBS_DIR} not found.")
        return

    job_files = sorted(RAW_JOBS_DIR.glob("*.txt"))
    if not job_files:
        print("No job files found.")
        return

    print(f"Found {len(job_files)} job files. Classifying roles using Gemini...\n")

    try:
        client = get_gemini_client()
    except ValueError as e:
        print(e)
        return

    # Build reverse map: role -> [job_ids]
    role_mapping: dict[str, list[int]] = {}

    for file_path in job_files:
        # Extract job ID number from filename e.g. job1.txt -> 1
        match = re.search(r"job(\d+)\.txt$", file_path.name, re.IGNORECASE)
        if not match:
            print(f"  [Skip] Could not extract ID from: {file_path.name}")
            continue

        job_id = int(match.group(1))

        try:
            job_text = file_path.read_text(encoding="utf-8").strip()
            if not job_text:
                print(f"  [Skip] Empty file: {file_path.name}")
                continue

            role = classify_job(client, job_text)

            if role not in role_mapping:
                role_mapping[role] = []
            role_mapping[role].append(job_id)

            print(f"  {file_path.name} → {role}")

        except Exception as e:
            print(f"  [Error] {file_path.name}: {e}")

    # Sort job IDs within each role
    for role in role_mapping:
        role_mapping[role].sort()

    # Save
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(role_mapping, f, indent=2, ensure_ascii=False)

    print(f"\nRole mapping saved to {OUTPUT_FILE.name}")
    print("\nSummary:")
    for role, ids in sorted(role_mapping.items()):
        print(f"  {role}: {len(ids)} jobs {ids}")


if __name__ == "__main__":
    main()

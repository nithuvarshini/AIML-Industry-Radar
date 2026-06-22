"""
job_collector.py

Collects real AI/ML job postings from 3 sources:
1. RemoteOK  — free public API, no auth
2. Greenhouse — free public API, no auth, queries known AI companies
3. Adzuna    — free tier API, needs ADZUNA_APP_ID + ADZUNA_APP_KEY in .env

Each job is saved as a .txt file in Raw_Jobs/
Deduplication via SHA256 hash stored in Raw_Jobs/seen_jobs.json
"""

import os
import json
import hashlib
import time
import re
from pathlib import Path
from dotenv import load_dotenv
import requests

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_JOBS_DIR = BASE_DIR / "Raw_Jobs"
SEEN_JOBS_FILE = RAW_JOBS_DIR / "seen_jobs.json"

RAW_JOBS_DIR.mkdir(exist_ok=True)

# Keywords to filter AI/ML relevant jobs
AI_KEYWORDS = [
    "machine learning", "artificial intelligence", "data scientist",
    "ai engineer", "ml engineer", "llm", "deep learning", "nlp",
    "data engineer", "mlops", "generative ai", "large language model",
    "computer vision", "rag", "langchain", "pytorch", "tensorflow",
]

# Known AI companies on Greenhouse
GREENHOUSE_COMPANIES = [
    "openai", "anthropic", "cohere", "huggingface", "mistral",
    "scale-ai", "weights-biases", "databricks", "anyscale",
    "together-ai", "modal-labs", "replicate",
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def load_seen_jobs() -> set:
    if SEEN_JOBS_FILE.exists():
        with open(SEEN_JOBS_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()


def save_seen_jobs(seen: set):
    with open(SEEN_JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(list(seen), f, indent=2)


def make_hash(title: str, company: str) -> str:
    raw = f"{title.lower().strip()}|{company.lower().strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def is_ai_relevant(text: str) -> bool:
    lower = text.lower()
    return any(kw in lower for kw in AI_KEYWORDS)


def get_next_job_id() -> int:
    existing = [
        int(re.search(r"job(\d+)\.txt", f.name).group(1))
        for f in RAW_JOBS_DIR.glob("job*.txt")
        if re.search(r"job(\d+)\.txt", f.name)
    ]
    return max(existing, default=0) + 1


def save_job(job_id: int, title: str, company: str, location: str, description: str) -> str:
    content = f"{title}\n{company} | {location}\n\n{description.strip()}"
    file_path = RAW_JOBS_DIR / f"job{job_id}.txt"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    return file_path.name


# ── Source 1: RemoteOK ────────────────────────────────────────────────────────

def collect_remoteok(seen: set, next_id: int) -> tuple[int, int]:
    print("\n[RemoteOK] Fetching jobs...")
    saved = 0

    try:
        response = requests.get(
            "https://remoteok.com/api",
            headers={"User-Agent": "AIML-Industry-Radar/1.0"},
            timeout=15,
        )
        response.raise_for_status()
        jobs = response.json()

        # First item is metadata, skip it
        jobs = [j for j in jobs if isinstance(j, dict) and j.get("position")]

        for job in jobs:
            title = job.get("position", "")
            company = job.get("company", "Unknown")
            location = job.get("location", "Remote")
            description = job.get("description", "")
            tags = " ".join(job.get("tags", []))
            full_text = f"{title} {description} {tags}"

            if not is_ai_relevant(full_text):
                continue

            job_hash = make_hash(title, company)
            if job_hash in seen:
                continue

            filename = save_job(next_id, title, company, location, description or tags)
            seen.add(job_hash)
            print(f"  [Saved] job{next_id}.txt — {title} @ {company}")
            next_id += 1
            saved += 1

    except Exception as e:
        print(f"  [Error] RemoteOK: {e}")

    print(f"  → {saved} new jobs from RemoteOK")
    return next_id, saved


# ── Source 2: Greenhouse ──────────────────────────────────────────────────────

def collect_greenhouse(seen: set, next_id: int) -> tuple[int, int]:
    print("\n[Greenhouse] Fetching jobs from AI companies...")
    saved = 0

    for company_slug in GREENHOUSE_COMPANIES:
        try:
            url = f"https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs?content=true"
            response = requests.get(url, timeout=15)

            if response.status_code != 200:
                continue

            data = response.json()
            jobs = data.get("jobs", [])

            for job in jobs:
                title = job.get("title", "")
                location = job.get("location", {}).get("name", "Remote")
                description = job.get("content", "")

                # Strip HTML tags from description
                description = re.sub(r"<[^>]+>", " ", description)
                description = re.sub(r"\s+", " ", description).strip()

                if not is_ai_relevant(f"{title} {description}"):
                    continue

                job_hash = make_hash(title, company_slug)
                if job_hash in seen:
                    continue

                filename = save_job(next_id, title, company_slug.replace("-", " ").title(), location, description)
                seen.add(job_hash)
                print(f"  [Saved] job{next_id}.txt — {title} @ {company_slug}")
                next_id += 1
                saved += 1

            time.sleep(0.5)  # Be polite to the API

        except Exception as e:
            print(f"  [Error] Greenhouse/{company_slug}: {e}")

    print(f"  → {saved} new jobs from Greenhouse")
    return next_id, saved


# ── Source 3: Adzuna ──────────────────────────────────────────────────────────

def collect_adzuna(seen: set, next_id: int) -> tuple[int, int]:
    print("\n[Adzuna] Fetching jobs...")
    saved = 0

    app_id = os.getenv("ADZUNA_APP_ID")
    app_key = os.getenv("ADZUNA_APP_KEY")

    if not app_id or not app_key:
        print("  [Skip] ADZUNA_APP_ID or ADZUNA_APP_KEY not set in .env")
        return next_id, saved

    search_terms = ["AI engineer", "machine learning engineer", "data scientist", "LLM engineer"]

    for term in search_terms:
        try:
            url = "https://api.adzuna.com/v1/api/jobs/gb/search/1"
            params = {
                "app_id": app_id,
                "app_key": app_key,
                "what": term,
                "results_per_page": 20,
                "content-type": "application/json",
            }

            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            jobs = data.get("results", [])

            for job in jobs:
                title = job.get("title", "")
                company = job.get("company", {}).get("display_name", "Unknown")
                location = job.get("location", {}).get("display_name", "Unknown")
                description = job.get("description", "")

                if not is_ai_relevant(f"{title} {description}"):
                    continue

                job_hash = make_hash(title, company)
                if job_hash in seen:
                    continue

                filename = save_job(next_id, title, company, location, description)
                seen.add(job_hash)
                print(f"  [Saved] job{next_id}.txt — {title} @ {company}")
                next_id += 1
                saved += 1

            time.sleep(1)  # Adzuna rate limit

        except Exception as e:
            print(f"  [Error] Adzuna/{term}: {e}")

    print(f"  → {saved} new jobs from Adzuna")
    return next_id, saved


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 50)
    print("AIML Industry Radar — Job Collector")
    print("=" * 50)

    seen = load_seen_jobs()
    print(f"Already seen: {len(seen)} jobs")

    next_id = get_next_job_id()
    print(f"Next job ID: {next_id}")

    total = 0

    next_id, count = collect_remoteok(seen, next_id)
    total += count

    next_id, count = collect_greenhouse(seen, next_id)
    total += count

    next_id, count = collect_adzuna(seen, next_id)
    total += count

    save_seen_jobs(seen)

    print("\n" + "=" * 50)
    print(f"Collection complete. Total new jobs saved: {total}")
    print(f"Raw_Jobs now contains: {len(list(RAW_JOBS_DIR.glob('job*.txt')))} job files")
    print("=" * 50)
    print("\nNext step: run the full pipeline to process new jobs:")
    print("  python extract_skills.py")
    print("  python normalize_skills.py")
    print("  python classify_roles.py")
    print("  python aggregate_skills.py")
    print("  python role_skill_analysis.py")
    print("  python skill_insights.py")
    print("  python recommendation_engine.py")
    print("  python roadmap_generator.py")
    print("  python dashboard_data_generator.py")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
role_skill_analysis.py

Description:
    Analyzes extracted job skills across different industry roles by parsing numeric
    job IDs from file names, matching them against role index arrays defined in 
    role_mapping.json, normalizes technical terms, and calculates frequency distributions.

Project Structure Context:
    AIML-Industry-Radar/
    ├── Scripts/
    │   └── role_skill_analysis.py
    ├── Extracted_Skills/
    ├── Reports/
    └── role_mapping.json
"""

import json
import logging
import re
from collections import Counter
from pathlib import Path
from typing import Dict, Any, Optional, List

# --- Logging Configuration ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --- Normalization Registry ---
# Case-insensitive mapping to standard canonical skill names
NORMALIZATION_MAP: Dict[str, str] = {
    "llm": "LLMs",
    "llms": "LLMs",
    "large language models": "LLMs",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "aws cloud": "AWS",
    "amazon web services": "AWS",
    "aws": "AWS",
    "mcp": "MCP",
    "model context protocol": "MCP"
}

# Regex compiler to extract numbers from filenames safely (e.g., 'job17.json' -> 17)
JOB_ID_REGEX = re.compile(r"job(\d+)\.json$", re.IGNORECASE)

def normalize_skill_name(skill: str) -> str:
    """
    Cleans up whitespace and normalizes raw skill strings to a canonical format
    based on the predefined normalization rules.
    """
    cleaned = " ".join(skill.strip().split())
    lowered = cleaned.lower()
    return NORMALIZATION_MAP.get(lowered, cleaned)


def load_json_file(file_path: Path) -> Optional[Any]:
    """
    Safely opens and loads a JSON file with UTF-8 encoding, handling exceptions.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
    except json.JSONDecodeError as e:
        logger.error(f"Malformed JSON in file {file_path}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error loading {file_path}: {e}")
    return None


def find_role_by_id(job_id: int, role_mapping: Dict[str, List[int]]) -> Optional[str]:
    """
    Finds the role name that contains the provided job ID integer.
    """
    for role, ids in role_mapping.items():
        if job_id in ids:
            return role
    return None


def main() -> None:
    # Resolve project root dynamically based on requested pattern
    base_dir = Path(__file__).resolve().parent.parent
    role_mapping_path = base_dir / "role_mapping.json"
    skills_dir = base_dir / "Cleaned_Skills"
    report_output_path = base_dir / "Reports" / "role_skill_analysis.json"

    logger.info("Initializing role skill frequency analysis pipeline...")

    # 1. Load the corrected array-based role mapping configuration
    role_mapping = load_json_file(role_mapping_path)
    if not role_mapping or not isinstance(role_mapping, dict):
        logger.critical("Aborting analysis: 'role_mapping.json' could not be loaded or format is incorrect.")
        return

    # 2. Prepare frequency storage per unique role
    # Structure: { "Role Name": Counter({ "Skill": Count }) }
    role_skill_counts: Dict[str, Counter] = {}

    # 3. Target verification and iteration over Cleaned_Skills
    if not skills_dir.exists() or not skills_dir.is_dir():
        logger.critical(f"Aborting analysis: Directory '{skills_dir}' does not exist.")
        return

    json_files = list(skills_dir.glob("*.json"))
    logger.info(f"Found {len(json_files)} extracted skill data files to process.")

    for file_path in json_files:
        filename = file_path.name
        
        # Extract the sequence number from filename
        match = JOB_ID_REGEX.search(filename)
        if not match:
            logger.warning(f"Skipping '{filename}': No numeric ID found in file name string.")
            continue
        
        job_id = int(match.group(1))
        
        # Find which role covers this ID list array entry
        role_name = find_role_by_id(job_id, role_mapping)
        if not role_name:
            logger.warning(f"Skipping '{filename}': Job ID {job_id} cannot be mapped to any role in role_mapping.json.")
            continue

        # Load file skills structure data
        extracted_data = load_json_file(file_path)
        if not extracted_data:
            continue

        # Initialize Counter instance for the role dynamically if unseen
        if role_name not in role_skill_counts:
            role_skill_counts[role_name] = Counter()

        # Accommodate lists, standalone strings, or deep category dictionary structures
        skills_to_process = []
        if isinstance(extracted_data, list):
            skills_to_process = extracted_data
        elif isinstance(extracted_data, dict):
            for content in extracted_data.values():
                if isinstance(content, list):
                    skills_to_process.extend(content)
                elif isinstance(content, str):
                    skills_to_process.append(content)

        # Normalize metrics and increment frequencies
        for raw_skill in skills_to_process:
            if isinstance(raw_skill, str) and raw_skill.strip():
                canonical_skill = normalize_skill_name(raw_skill)
                role_skill_counts[role_name][canonical_skill] += 1

    # 4. Construct sorted final reporting metric structure
    final_analysis_report: Dict[str, Dict[str, int]] = {}
    
    for role, counter in role_skill_counts.items():
        # Sort values descending by count frequency, with alphabetical sorting for equal ties
        sorted_skills = sorted(counter.items(), key=lambda x: (-x[1], x[0]))
        final_analysis_report[role] = dict(sorted_skills)

    # 5. Write analytical results array payload out safely to the file system
    try:
        report_output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(report_output_path, "w", encoding="utf-8") as out_file:
            json.dump(final_analysis_report, out_file, indent=4, ensure_ascii=False)
        logger.info(f"Analysis successfully saved to directory: {report_output_path}")
    except Exception as e:
        logger.critical(f"Failed to write final report metrics file: {e}")


if __name__ == "__main__":
    main()
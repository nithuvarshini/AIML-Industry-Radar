import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

EXTRACTED_DIR = BASE_DIR / "Extracted_Skills"
CLEANED_DIR = BASE_DIR / "Cleaned_Skills"
MASTER_SKILLS_FILE = BASE_DIR / "master_skills.txt"

CLEANED_DIR.mkdir(exist_ok=True)

NORMALIZATION_MAP = {
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",

    "llm": "LLMs",
    "large language models": "LLMs",

    "large language model": "LLMs",

    "optical character recognition": "OCR",
    "optical character recognition (ocr)": "OCR",

    "model context protocol": "MCP",
    "model context protocol (mcp)": "MCP",

    "amazon web services": "AWS",
    "aws cloud": "AWS",

    "google cloud platform": "GCP",

    "scikit learn": "Scikit-Learn",
    "scikit-learn": "Scikit-Learn"
}


def load_master_skills():
    if not MASTER_SKILLS_FILE.exists():
        return set()

    with open(MASTER_SKILLS_FILE, "r", encoding="utf-8") as f:
        return {line.strip() for line in f if line.strip()}


MASTER_SKILLS = load_master_skills()


def normalize_skill(skill):
    skill = skill.strip()

    key = skill.lower()

    if key in NORMALIZATION_MAP:
        return NORMALIZATION_MAP[key]

    return skill


def process_file(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    cleaned_data = {}

    for category, skills in data.items():

        if not isinstance(skills, list):
            cleaned_data[category] = skills
            continue

        normalized_skills = []

        for skill in skills:

            if not isinstance(skill, str):
                continue

            normalized_skill = normalize_skill(skill)

            normalized_skills.append(normalized_skill)

        unique_skills = sorted(set(normalized_skills))

        cleaned_data[category] = unique_skills

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, indent=4, ensure_ascii=False)


def main():

    json_files = list(EXTRACTED_DIR.glob("*.json"))

    print(f"Found {len(json_files)} files")

    for file_path in json_files:

        output_path = CLEANED_DIR / file_path.name

        process_file(file_path, output_path)

        print(f"Processed {file_path.name}")

    print("Done")


if __name__ == "__main__":
    main()
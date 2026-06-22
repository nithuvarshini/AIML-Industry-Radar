import json
import os

_SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
_BASE_DIR = os.path.realpath(os.path.join(_SCRIPTS_DIR, ".."))

EXTRACTED_DIR = os.path.realpath(os.path.join(_BASE_DIR, "Extracted_Skills"))
CLEANED_DIR = os.path.realpath(os.path.join(_BASE_DIR, "Cleaned_Skills"))
MASTER_SKILLS_FILE = os.path.join(_BASE_DIR, "master_skills.txt")

os.makedirs(CLEANED_DIR, exist_ok=True)

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
    if not os.path.exists(MASTER_SKILLS_FILE):
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


def _safe_join(directory: str, filename: str) -> str:
    path = os.path.realpath(os.path.join(directory, os.path.basename(filename)))
    if not path.startswith(directory + os.sep):
        raise ValueError(f"Access denied: '{path}' is outside '{directory}'")
    return path


def process_file(input_filename: str, output_filename: str):
    input_path = _safe_join(EXTRACTED_DIR, input_filename)
    output_path = _safe_join(CLEANED_DIR, output_filename)
    with open(input_path, "r", encoding="utf-8") as f:
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

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(cleaned_data, f, indent=4, ensure_ascii=False)


def main():
    json_files = [f for f in os.listdir(EXTRACTED_DIR) if f.endswith(".json")]
    print(f"Found {len(json_files)} files")
    for filename in json_files:
        process_file(filename, filename)
        print(f"Processed {filename}")
    print("Done")


if __name__ == "__main__":
    main()
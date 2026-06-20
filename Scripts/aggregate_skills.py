import json
import logging
from collections import Counter
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


def normalize_skill(skill_name: str) -> str:
    """Normalize skill names to standard forms."""

    if not skill_name:
        return ""

    clean_name = " ".join(skill_name.strip().split())
    lower_name = clean_name.lower()

    normalization_map = {
        "LLMs": [
            "llm",
            "llms",
            "large language model",
            "large language models"
        ],

        "Machine Learning": [
            "ml",
            "machine learning"
        ],

        "AWS": [
            "aws",
            "aws cloud",
            "amazon web services"
        ],

        "RAG": [
            "rag",
            "retrieval augmented generation",
            "retrieval-augmented generation"
        ],

        "MCP": [
            "mcp",
            "model context protocol",
            "model context protocol (mcp)"
        ],

        "Scikit-Learn": [
            "sklearn",
            "scikit learn",
            "scikit-learn"
        ]
    }

    for standard_name, aliases in normalization_map.items():
        if lower_name in aliases:
            return standard_name

    return clean_name


def aggregate_skills(source_dir, output_file):
    """Read all JSON files, count normalized skills, save results."""

    if not source_dir.exists() or not source_dir.is_dir():
        logging.error(f"Source directory '{source_dir}' does not exist.")
        return

    skill_counter = Counter()

    json_files = list(source_dir.glob("*.json"))

    if not json_files:
        logging.warning(f"No JSON files found in '{source_dir}'.")
        return

    logging.info(f"Found {len(json_files)} JSON files.")

    for file_path in json_files:

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if not isinstance(data, dict):
                logging.warning(
                    f"Skipping {file_path.name}: Invalid JSON structure."
                )
                continue

            for category, skills in data.items():

                if not isinstance(skills, list):
                    continue

                for skill in skills:

                    if not isinstance(skill, str):
                        continue

                    normalized_skill = normalize_skill(skill)

                    if normalized_skill:
                        skill_counter[normalized_skill] += 1

        except json.JSONDecodeError:
            logging.error(
                f"Invalid JSON file: {file_path.name}"
            )

        except Exception as e:
            logging.error(
                f"Error processing {file_path.name}: {e}"
            )

    if not skill_counter:
        logging.warning("No skills found.")
        return

    sorted_skills = dict(skill_counter.most_common())

    try:

        output_file.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(
                sorted_skills,
                f,
                indent=4,
                ensure_ascii=False
            )

        logging.info(
            f"Saved results to: {output_file}"
        )

        logging.info(
            f"Total unique skills found: {len(sorted_skills)}"
        )

    except Exception as e:
        logging.error(
            f"Failed to save report: {e}"
        )


if __name__ == "__main__":

    BASE_DIR = Path(__file__).resolve().parent.parent

    SOURCE_DIRECTORY = BASE_DIR / "Cleaned_Skills"

    OUTPUT_FILE = (
        BASE_DIR
        / "Reports"
        / "top_skills.json"
    )

    aggregate_skills(
        SOURCE_DIRECTORY,
        OUTPUT_FILE
    )
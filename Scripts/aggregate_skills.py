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


def _process_file(file_path: Path, allowed_source: Path, skill_counter: Counter) -> None:
    """Validate, load and count skills from a single JSON file."""
    resolved_file = file_path.resolve()
    if not str(resolved_file).startswith(str(allowed_source)):
        logging.warning(f"Skipping '{file_path.name}': path outside allowed directory.")
        return
    try:
        with open(resolved_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON file: {file_path.name}")
        return
    except Exception as e:
        logging.error(f"Error processing {file_path.name}: {e}")
        return
    if not isinstance(data, dict):
        logging.warning(f"Skipping {file_path.name}: Invalid JSON structure.")
        return
    _count_skills(data, skill_counter)


def _count_skills(data: dict, skill_counter: Counter) -> None:
    """Extract and count normalized skills from a parsed JSON dict."""
    for skills in data.values():
        if not isinstance(skills, list):
            continue
        for skill in skills:
            if isinstance(skill, str):
                normalized = normalize_skill(skill)
                if normalized:
                    skill_counter[normalized] += 1


def _save_results(skill_counter: Counter, output_file: Path, allowed_output: Path) -> None:
    """Validate output path and write sorted results to disk."""
    resolved_output = output_file.resolve()
    if not str(resolved_output).startswith(str(allowed_output)):
        logging.error("Access denied: output path is outside the allowed directory.")
        return
    try:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(dict(skill_counter.most_common()), f, indent=4, ensure_ascii=False)
        logging.info(f"Saved results to: {output_file}")
        logging.info(f"Total unique skills found: {len(skill_counter)}")
    except Exception as e:
        logging.error(f"Failed to save report: {e}")


def aggregate_skills(source_dir: Path, output_file: Path) -> None:
    """Orchestrate reading, counting, and saving of skill aggregation."""
    if not source_dir.exists() or not source_dir.is_dir():
        logging.error(f"Source directory '{source_dir}' does not exist.")
        return

    json_files = list(source_dir.glob("*.json"))
    if not json_files:
        logging.warning(f"No JSON files found in '{source_dir}'.")
        return

    logging.info(f"Found {len(json_files)} JSON files.")
    allowed_source = source_dir.resolve()
    allowed_output = output_file.resolve().parent
    skill_counter: Counter = Counter()

    for file_path in json_files:
        _process_file(file_path, allowed_source, skill_counter)

    if not skill_counter:
        logging.warning("No skills found.")
        return

    _save_results(skill_counter, output_file, allowed_output)


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
import os
import json
from pathlib import Path
from typing import List
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel, Field

# Load environment variables from .env file
load_dotenv()

# Initialize directories
BASE_DIR = Path(__file__).resolve().parent.parent

RAW_JOBS_DIR = BASE_DIR / "Raw_Jobs"
EXTRACTED_SKILLS_DIR = BASE_DIR / "Extracted_Skills"
EXTRACTED_SKILLS_DIR.mkdir(exist_ok=True)

# Define the desired JSON schema using Pydantic
class JobSkills(BaseModel):
    programming_languages: List[str] = Field(default_factory=list, description="e.g., Python, C++, Go")
    frameworks_libraries: List[str] = Field(default_factory=list, description="e.g., PyTorch, TensorFlow, Scikit-Learn")
    databases: List[str] = Field(default_factory=list, description="e.g., PostgreSQL, MongoDB, Pinecone")
    cloud_platforms: List[str] = Field(default_factory=list, description="e.g., AWS, GCP, Azure")
    aiml_technologies: List[str] = Field(default_factory=list, description="e.g., LLMs, RAG, Computer Vision, Transformers")
    data_engineering_tools: List[str] = Field(default_factory=list, description="e.g., Spark, Airflow, Kafka")
    mlops_tools: List[str] = Field(default_factory=list, description="e.g., MLflow, Kubeflow, DVC, Weights & Biases")

def get_gemini_client() -> genai.Client:
    """Initializes and returns the Gemini client using the environment variable."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Critical Error: GEMINI_API_KEY is not set in the environment or .env file.")
    return genai.Client(api_key=api_key)

def extract_skills_from_job(client: genai.Client, job_description: str) -> str:
    """Sends job text to Gemini and forces a structured JSON response based on JobSkills schema."""
    prompt = f"""
    Analyze the following job description and extract the technical skills into their respective categories.
    Only include skills explicitly mentioned or strongly implied by technologies listed.
    If a category has no matching skills, leave it as an empty list.
    You are an AI Industry Intelligence Extractor.Extract only technical skills.Normalize every skill name.
    Examples:
    LLM, LLMs, Large Language Models → LLMs
    ML, Machine Learning → Machine Learning
    DL, Deep Learning → Deep Learning
    AWS Cloud, Amazon Web Services → AWS
    Return only normalized names.
    Output JSON:
    {
    ...
    }

    Job Description:
    {job_description}
    """
    
    # Using gemini-2.5-flash as it's fast, cost-effective, and highly capable at structured extraction
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=JobSkills,
            temperature=0.1,
            max_output_tokens=1024,
        ),
    )
    return response.text

def main():
    # 1. Initialize Client
    try:
        client = get_gemini_client()
    except ValueError as e:
        print(e)
        return

    # 2. Check if source folder exists
    if not RAW_JOBS_DIR.exists() or not RAW_JOBS_DIR.is_dir():
        print(f"Error: Source directory '{RAW_JOBS_DIR}' does not exist. Please create it and add .txt files.")
        return

    job_files = list(RAW_JOBS_DIR.glob("*.txt"))
    if not job_files:
        print(f"No .txt files found in '{RAW_JOBS_DIR}'. Exiting.")
        return

    print(f"Found {len(job_files)} job files to process.\n---")

    # 3. Process each file
    for file_path in job_files:
        output_file_path = EXTRACTED_SKILLS_DIR / f"{file_path.stem}.json"

        # Skip already processed files
        if output_file_path.exists():
            print(f"  [Skip] Already processed: {file_path.name}")
            continue

        print(f"Processing: {file_path.name}...")
        
        try:
            # Read job text
            with open(file_path, 'r', encoding='utf-8') as f:
                job_text = f.read().strip()
            
            if not job_text:
                print(f"  [Warning] Skipping empty file: {file_path.name}")
                continue

            # Call Gemini API
            json_string = extract_skills_from_job(client, job_text)
            
            # Parse to valid JSON object to pretty-print save it
            json_data = json.loads(json_string)
            
            # Save output
            with open(output_file_path, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=4, ensure_ascii=False)
                
            print(f"  [Success] Saved to {output_file_path.name}")

        except APIError as e:
            print(f"  [API Error] Gemini API failed for {file_path.name}: {e}")
        except json.JSONDecodeError:
            print(f"  [Error] Failed to parse JSON response from Gemini for {file_path.name}")
        except OSError as e:
            print(f"  [File Error] Could not read/write file data for {file_path.name}: {e}")
        except Exception as e:
            print(f"  [Unexpected Error] {file_path.name}: {e}")

    print("\n--- Processing Complete! ---")

if __name__ == "__main__":
    main()
from fastapi import FastAPI
from pathlib import Path
import json

app = FastAPI(
    title="AIML Industry Radar",
    version="1.0.0"
)

BASE_DIR = Path(__file__).resolve().parent.parent

def load_json(file_path):

    if not file_path.exists():
        return {"error": "File not found"}

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/")
def home():
    return {
        "project": "AIML Industry Radar",
        "status": "running"
    }


@app.get("/top-skills")
def get_top_skills():
    return load_json(
        BASE_DIR / "Reports" / "top_skills.json"
    )
    
@app.get("/role-analysis")
def get_role_analysis():
    return load_json(
        BASE_DIR / "Reports" / "role_skill_analysis.json"
    )

@app.get("/skill-insights")
def get_skill_insights():
    return load_json(
        BASE_DIR / "Reports" / "skill_insights.json"
    )

    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
    
@app.get("/dashboard")
def get_dashboard():
    return load_json(
        BASE_DIR / "Reports" / "dashboard_data.json"
    )
    
@app.get("/recommendations")
def get_recommendations():
    return load_json(
        BASE_DIR / "Reports" / "recommendations.json"
    )
    
@app.get("/skill-insights")
def get_skill_insights():
    return load_json(
        BASE_DIR / "Reports" / "skill_insights.json"
    )
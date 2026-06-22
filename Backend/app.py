from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import json
import os

app = FastAPI(
    title="AIML Industry Radar",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORTS_DIR: str = os.path.realpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Reports")
)

ALLOWED_FILES = {
    "top_skills.json",
    "role_skill_analysis.json",
    "skill_insights.json",
    "dashboard_data.json",
    "recommendations.json",
    "roadmap.json",
}

def load_json(filename: str):
    if filename not in ALLOWED_FILES:
        return {"error": "Access denied"}
    safe_path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(safe_path):
        return {"error": "File not found"}
    try:
        with open(safe_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"error": "Report file is malformed"}

@app.get("/")
def home():
    return {
        "project": "AIML Industry Radar",
        "status": "running"
    }


@app.get("/top-skills")
def get_top_skills():
    return load_json("top_skills.json")

@app.get("/role-analysis")
def get_role_analysis():
    return load_json("role_skill_analysis.json")

@app.get("/skill-insights")
def get_skill_insights():
    return load_json("skill_insights.json")

@app.get("/dashboard")
def get_dashboard():
    return load_json("dashboard_data.json")

@app.get("/recommendations")
def get_recommendations():
    return load_json("recommendations.json")

@app.get("/roadmap")
def get_roadmap():
    return load_json("roadmap.json")
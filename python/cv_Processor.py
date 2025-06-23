import os
from docsParser import parse_file
from agent_Siya import query_gemini_cv_parser


class CVProcessor:
    def __init__(self, model: str, db_connection):
        self.model = model
        self.db_connection = db_connection

    def process(self, file_path: str):
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return False

        print(f"\n📄 Parsing file: {file_path}")
        cv_content = parse_file(file_path)

        if not cv_content or not cv_content.strip():
            print("❌ No content extracted from file.")
            return False

        print(f"✅ Extracted {len(cv_content)} characters.")
        print("\n🤖 Sending to Ollama for structured CV extraction...\n")

        prompt = f"""
You must respond with ONLY valid JSON. No other text, no explanations, no markdown.

Extract information from this resume and return it in this EXACT JSON format:

{{
  "name": "Full Name",
  "role": "Job Title/Role",
  "email": "email@domain.com",
  "phone": "phone number",
  "location": "city, country",
  "github_url": "github link or null",
  "linkedin_url": "linkedin link or null", 
  "portfolio_url": "portfolio link or null",
  "summary": "Brief professional summary",
  "total_experience": 5.5,
  "education_gap": false,
  "work_gap": false,
  "education": [
    {{
      "institute": "University Name",
      "degree": "Degree Name",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    }}
  ],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name", 
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "description": "Job description"
    }}
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "soft_skills": [
    {{
      "skill": "Communication",
      "strength_level": "High"
    }}
  ],
  "projects": [
    {{
      "title": "Project Name",
      "description": "Project description"
    }}
  ],
  "employment_gaps": [],
  "scoring": {{
    "tech_score": 8.5,
    "communication_score": 7.0,
    "ai_fit_score": 8.0,
    "overall_score": 7.8
  }}
}}

Resume Content:
{cv_content[:2000]}

Respond with ONLY the JSON object, nothing else.
"""
        try:
            query_gemini_cv_parser(prompt=prompt,  db_connection=self.db_connection)
            return True
        except Exception as e:
            print(f"❌ Failed to process CV via Ollama: {e}")
            return False

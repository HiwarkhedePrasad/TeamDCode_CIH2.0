import os
from docsParser import parse_file
from agent_Siya import query_ollama_stream

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
Extract the following information in proper JSON format from this resume:
- name, role, email, phone, location, github_url, linkedin_url, portfolio_url
- summary of candidate (max 5 lines)
- total_experience (in years, float), education_gap (true/false), work_gap (true/false)
- education: list of institute, degree, start_date, end_date
- experience: list of title, company, start_date, end_date, description
- skills: list of technical skills
- soft_skills: list of {{ "skill": "", "strength_level": "High/Medium/Low" }}
- projects: title and description
- employment_gaps (if any): gap_start, gap_end, gap_duration_in_months, reason
- scoring: tech_score, communication_score, ai_fit_score, overall_score

Resume Content:
{cv_content[:2000]}
"""
        try:
            query_ollama_stream(prompt=prompt, model=self.model, db_connection=self.db_connection)
            return True
        except Exception as e:
            print(f"❌ Failed to process CV via Ollama: {e}")
            return False

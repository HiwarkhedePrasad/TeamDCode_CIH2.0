from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os
import uuid
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any

# Import your existing modules
from config import DatabaseConfig, OllamaConfig
from cv_Processor import CVProcessor
from FilterAndTestLink import JobRequirement, SkillMatcher, EmailSender

# Create FastAPI app
app = FastAPI(
    title="AutoScreen CV Processor API",
    description="API for processing resumes and matching candidates with job positions",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def connect_to_db(db_config):
    """Establishes a connection to the MySQL database."""
    return mysql.connector.connect(
        host=db_config.host,
        user=db_config.user,
        password=db_config.password,
        database=db_config.database
    )

def setup_job_requirements():
    """Defines a list of predefined job requirements."""
    return [
        JobRequirement(
            title="Full-Stack Developer",
            required_skills=["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "HTML", "CSS", "REST API", "Git"],
            preferred_skills=["TypeScript", "Next.js", "Docker", "AWS"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Engineering"
        ),
        JobRequirement(
            title="UI/UX Designer",
            required_skills=["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Responsive Design","UI/UX"],
            preferred_skills=["Illustrator", "Photoshop", "Accessibility", "Design Systems"],
            min_experience=0.5,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Design"
        ),
        JobRequirement(
            title="DevOps Engineer",
            required_skills=["Linux", "CI/CD", "Docker", "Kubernetes", "Git", "Bash"],
            preferred_skills=["Terraform", "AWS", "Monitoring", "Ansible"],
            min_experience=1,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Infrastructure"
        ),
        JobRequirement(
            title="Mobile App Developer (Android)",
            required_skills=["Kotlin", "Java", "Android SDK", "REST APIs", "UI/UX Design"],
            preferred_skills=["Jetpack Compose", "Firebase", "Unit Testing"],
            min_experience=0.5,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Mobile Development"
        ),
        JobRequirement(
            title="Mobile App Developer (iOS)",
            required_skills=["Swift", "Xcode", "iOS SDK", "UIKit", "REST APIs"],
            preferred_skills=["SwiftUI", "Core Data", "Firebase"],
            min_experience=0.5,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Mobile Development"
        ),
        JobRequirement(
            title="Cloud Engineer",
            required_skills=["AWS", "GCP", "Azure", "Cloud Networking", "Security", "Terraform"],
            preferred_skills=["DevOps", "Monitoring Tools", "Serverless", "Cost Optimization"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Infrastructure"
        ),
        JobRequirement(
            title="QA Engineer",
            required_skills=["Manual Testing", "Automation", "Selenium", "Test Cases", "Bug Tracking", "API Testing"],
            preferred_skills=["JMeter", "Cypress", "CI/CD Integration", "Performance Testing"],
            min_experience=0.5,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Quality Assurance"
        ),
        JobRequirement(
            title="Product Manager",
            required_skills=["Product Roadmap", "Agile", "Scrum", "User Stories", "Market Research", "Wireframing"],
            preferred_skills=["SQL", "Analytics", "A/B Testing", "Figma"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Product"
        ),
        JobRequirement(
            title="Cybersecurity Analyst",
            required_skills=["Network Security", "Vulnerability Assessment", "SIEM", "Firewalls", "Incident Response"],
            preferred_skills=["Ethical Hacking", "Penetration Testing", "SOC", "Compliance Standards"],
            min_experience=1,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Security"
        ),
        JobRequirement(
            title="Business Analyst",
            required_skills=["Requirement Gathering", "Stakeholder Communication", "Data Analysis", "SQL", "Documentation"],
            preferred_skills=["Power BI", "Tableau", "UML", "JIRA"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Business"
        ),
        JobRequirement(
            title="Data Analyst",
            required_skills=["Python", "SQL", "Pandas", "Excel", "Data Visualization", "Statistics"],
            preferred_skills=["Power BI", "Tableau", "Machine Learning", "BigQuery"],
            min_experience=0.5,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Data"
        ),
        JobRequirement(
            title="Frontend Developer",
            required_skills=["JavaScript", "React", "HTML", "CSS", "Responsive Design", "Git", "Web APIs"],
            preferred_skills=["TypeScript", "Redux", "Webpack", "SASS"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Engineering"
        ),
        JobRequirement(
            title="Backend Developer",
            required_skills=["Node.js", "Express.js", "MongoDB", "REST API", "Database Design", "Git", "Authentication"],
            preferred_skills=["Python", "Docker", "Redis", "Microservices"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="Engineering"
        ),
        JobRequirement(
            title="AI/ML Developer",
            required_skills=["Python", "Machine Learning", "Data Science", "TensorFlow", "Pandas", "NumPy", "Statistics"],
            preferred_skills=["PyTorch", "Deep Learning", "NLP", "Computer Vision"],
            min_experience=0,
            test_link="localhost:4000/assessment/:assessmentId",
            department="AI Research"
        )
    ]

def get_last_inserted_candidate_id(db_connection):
    """Retrieves the ID of the last inserted candidate from the 'candidates' table."""
    cursor = db_connection.cursor()
    cursor.execute("SELECT MAX(id) FROM candidates")
    result = cursor.fetchone()
    cursor.close()
    return result[0] if result else None

def get_candidate_data_from_db(db_connection, candidate_id):
    """Fetches comprehensive candidate data, including skills, from the database."""
    cursor = db_connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM candidates WHERE id = %s", (candidate_id,))
    candidate = cursor.fetchone()

    if not candidate:
        cursor.close()
        return None

    cursor.execute("SELECT skill FROM skills WHERE candidate_id = %s", (candidate_id,))
    skills = [row['skill'] for row in cursor.fetchall()]
    candidate['skills'] = skills

    cursor.close()
    return candidate

def log_evaluation_results(db_connection, candidate_id, evaluation_results):
    """Logs the results of the candidate evaluation into a dedicated table."""
    cursor = db_connection.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evaluation_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidate_id INT,
                total_positions_checked INT,
                qualified_positions TEXT,
                notifications_sent INT,
                evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            )
        """)
        
        qualified_pos_str = ', '.join(evaluation_results['qualified_positions'])
        if not qualified_pos_str:
            qualified_pos_str = None

        cursor.execute("""
            INSERT INTO evaluation_logs
            (candidate_id, total_positions_checked, qualified_positions, notifications_sent)
            VALUES (%s, %s, %s, %s)
        """, (
            candidate_id,
            len(evaluation_results['evaluations']),
            qualified_pos_str,
            evaluation_results['notifications_sent']
        ))
        db_connection.commit()
        print(f"✅ Evaluation results logged for candidate ID: {candidate_id}")
    except Exception as e:
        print(f"⚠️ Failed to log evaluation results: {e}")
    finally:
        cursor.close()

def store_assessment_link_in_db(db_connection, assessment_uuid, candidate_id, job_title, candidate_email):
    """Stores the unique assessment link details in the 'assessments' table."""
    cursor = db_connection.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assessment_uuid VARCHAR(255) UNIQUE NOT NULL,
                candidate_id INT NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                candidate_email VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            )
        """)
        cursor.execute("""
            INSERT INTO assessments
            (assessment_uuid, candidate_id, job_title, candidate_email)
            VALUES (%s, %s, %s, %s)
        """, (assessment_uuid, candidate_id, job_title, candidate_email))
        db_connection.commit()
        print(f"✅ Assessment link (UUID: {assessment_uuid}) stored for candidate ID: {candidate_id}, Job: {job_title}")
    except mysql.connector.Error as err:
        print(f"⚠️ Failed to store assessment link: {err}")
        db_connection.rollback()
    finally:
        cursor.close()

async def process_resume_logic(file_path: str) -> Dict[str, Any]:
    """Core logic for processing resume and matching candidates."""
    # Load configurations
    db_config = DatabaseConfig.from_env()
    ollama_config = OllamaConfig.from_env()

    # Establish database connection
    try:
        db_connection = connect_to_db(db_config)
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

    # Setup email service
    email_sender = None
    try:
        email_sender = EmailSender.from_env()
        if email_sender and email_sender.email and email_sender.password:
            print("✅ Email service configured")
        else:
            print("⚠️ Email service configuration incomplete")
            email_sender = None
    except Exception as e:
        print(f"⚠️ Email service setup failed: {e}")
        email_sender = None

    # Setup job requirements
    job_requirements = setup_job_requirements()
    print(f"✅ Loaded {len(job_requirements)} job positions")

    # Process CV
    processor = CVProcessor(model=ollama_config.model, db_connection=db_connection)
    success = processor.process(file_path)

    if not success:
        db_connection.close()
        raise HTTPException(status_code=400, detail="CV processing failed")

    print("✅ CV processing complete. Structured data inserted.")
    candidate_id = get_last_inserted_candidate_id(db_connection)

    if not candidate_id:
        db_connection.close()
        raise HTTPException(status_code=500, detail="No candidate ID retrieved from database")

    # Fetch candidate data
    print(f"\n🔍 Retrieving candidate data for ID: {candidate_id}")
    candidate_data = get_candidate_data_from_db(db_connection, candidate_id)

    if not candidate_data:
        db_connection.close()
        raise HTTPException(status_code=404, detail="Failed to retrieve candidate data")

    # Initialize SkillMatcher
    skill_matcher = SkillMatcher()
    min_match_threshold = float(os.getenv("MIN_MATCH_THRESHOLD", 40.0))

    # Evaluation logic
    evaluation_results = {
        "candidate_name": candidate_data.get("name"),
        "candidate_email": candidate_data.get("email"),
        "evaluations": [],
        "notifications_sent": 0,
        "qualified_positions": []
    }

    candidate_skills = candidate_data.get("skills", [])
    if not candidate_skills:
        print(f"⚠️ No skills found for candidate {candidate_data.get('name')}")

    print(f"\n🔍 Evaluating {candidate_data.get('name')} for {len(job_requirements)} positions...")

    for job_req in job_requirements:
        print(f"\n📋 Checking fit for: {job_req.title}")

        # Perform skill matching
        matches = skill_matcher.find_skill_matches(candidate_skills, job_req.required_skills)
        match_score, match_details = skill_matcher.calculate_match_score(matches, len(job_req.required_skills))

        # Handle experience safely
        raw_candidate_experience = candidate_data.get("total_experience")
        candidate_experience = 0.0

        if raw_candidate_experience is not None:
            try:
                candidate_experience = float(raw_candidate_experience)
            except (ValueError, TypeError):
                print(f"⚠️ Warning: Invalid experience value for candidate {candidate_data.get('name')}")
                candidate_experience = 0.0

        meets_experience = candidate_experience >= job_req.min_experience

        # Compile evaluation
        evaluation = {
            "job_title": job_req.title,
            "match_score": match_score,
            "match_details": match_details,
            "meets_experience": meets_experience,
            "qualified": match_score >= min_match_threshold and meets_experience,
            "matched_skills": [m.candidate_skill for m in matches]
        }
        evaluation_results["evaluations"].append(evaluation)

        print(f"   📊 Match Score: {match_score:.1f}%")
        print(f"   👤 Experience: {candidate_experience} years (Required: {job_req.min_experience})")
        print(f"   ✅ Matched Skills: {', '.join(evaluation['matched_skills']) if evaluation['matched_skills'] else 'None'}")

        # Check qualification and send email
        if evaluation["qualified"]:
            print(f"   🎯 Candidate QUALIFIED for {job_req.title}")
            if email_sender:
                unique_assessment_id = str(uuid.uuid4())
                store_assessment_link_in_db(db_connection, unique_assessment_id, candidate_id, job_req.title, candidate_data.get("email"))
                success = email_sender.send_test_invitation(candidate_data, job_req, match_details, unique_assessment_id)
                if success:
                    evaluation_results["notifications_sent"] += 1
                    evaluation_results["qualified_positions"].append(job_req.title)
            else:
                print("   ⚠️ Email service not available")
        else:
            print(f"   ❌ Candidate not qualified for {job_req.title}")

    # Log evaluation results
    log_evaluation_results(db_connection, candidate_id, evaluation_results)

    # Close database connection
    db_connection.close()

    return {
        "status": "success",
        "candidate_id": candidate_id,
        "candidate_name": evaluation_results['candidate_name'],
        "candidate_email": evaluation_results['candidate_email'],
        "positions_evaluated": len(evaluation_results['evaluations']),
        "qualified_positions": evaluation_results['qualified_positions'],
        "notifications_sent": evaluation_results['notifications_sent'],
        "detailed_evaluations": evaluation_results['evaluations']
    }

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AutoScreen CV Processor API",
        "version": "1.0.0",
        "endpoints": {
            "/upload-resume": "POST - Upload and process resume file",
            "/health": "GET - Health check endpoint"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "API is running"}

@app.post("/test-upload")
async def test_upload(file: UploadFile = File(...)):
    """Simple test endpoint to verify file upload works"""
    try:
        content = await file.read()
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content),
            "message": "File received successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload and process a resume file (.pdf or .docx).
    Returns candidate evaluation results and qualified positions.
    """
    temp_file_path = None
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=422, detail="No file provided")
        
        # Check file size (optional - prevent very large files)
        if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=422, detail="File too large. Maximum size is 10MB")
        
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in ['.pdf', '.docx']:
            raise HTTPException(
                status_code=422, 
                detail="Only PDF and DOCX files are supported"
            )

        # Read file content
        file_content = await file.read()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name

        print(f"Processing file: {file.filename} (size: {len(file_content)} bytes)")
        
        # Process the resume
        result = await process_resume_logic(temp_file_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Resume processed successfully",
                "data": result
            }
        )

    except HTTPException as e:
        print(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                print(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as cleanup_error:
                print(f"Failed to cleanup temp file: {cleanup_error}")

@app.options("/upload-resume")
async def upload_resume_options():
    """Handle preflight requests for CORS"""
    return JSONResponse(
        status_code=200,
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
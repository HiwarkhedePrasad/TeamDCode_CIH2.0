import mysql.connector
import os
import uuid # Import uuid for generating unique IDs
from config import DatabaseConfig, OllamaConfig
from cv_Processor import CVProcessor

# --- REQUIRED IMPORTS FOR MATCHING IN MAIN ---
# Import JobRequirement, SkillMatcher, and EmailSender from skill_matcher.py
from FilterAndTestLink import JobRequirement, SkillMatcher, EmailSender
# No longer importing CandidateEvaluator if its core logic is moved here
# If you still have candidate_evaluator.py, you can now delete it or keep it as a placeholder if no other functions use it.
# from candidate_evaluator import CandidateEvaluator
# --- END REQUIRED IMPORTS ---

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
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Engineering"
        ),
        JobRequirement(
            title="UI/UX Designer",
            required_skills=["Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research", "Responsive Design","UI/UX"],
            preferred_skills=["Illustrator", "Photoshop", "Accessibility", "Design Systems"],
            min_experience=0.5,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Design"
        ),
        JobRequirement(
            title="DevOps Engineer",
            required_skills=["Linux", "CI/CD", "Docker", "Kubernetes", "Git", "Bash"],
            preferred_skills=["Terraform", "AWS", "Monitoring", "Ansible"],
            min_experience=1,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Infrastructure"
        ),
        JobRequirement(
            title="Mobile App Developer (Android)",
            required_skills=["Kotlin", "Java", "Android SDK", "REST APIs", "UI/UX Design"],
            preferred_skills=["Jetpack Compose", "Firebase", "Unit Testing"],
            min_experience=0.5,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Mobile Development"
        ),
        JobRequirement(
            title="Mobile App Developer (iOS)",
            required_skills=["Swift", "Xcode", "iOS SDK", "UIKit", "REST APIs"],
            preferred_skills=["SwiftUI", "Core Data", "Firebase"],
            min_experience=0.5,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Mobile Development"
        ),
        JobRequirement(
            title="Cloud Engineer",
            required_skills=["AWS", "GCP", "Azure", "Cloud Networking", "Security", "Terraform"],
            preferred_skills=["DevOps", "Monitoring Tools", "Serverless", "Cost Optimization"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Infrastructure"
        ),
        JobRequirement(
            title="QA Engineer",
            required_skills=["Manual Testing", "Automation", "Selenium", "Test Cases", "Bug Tracking", "API Testing"],
            preferred_skills=["JMeter", "Cypress", "CI/CD Integration", "Performance Testing"],
            min_experience=0.5,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Quality Assurance"
        ),
        JobRequirement(
            title="Product Manager",
            required_skills=["Product Roadmap", "Agile", "Scrum", "User Stories", "Market Research", "Wireframing"],
            preferred_skills=["SQL", "Analytics", "A/B Testing", "Figma"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Product"
        ),
        JobRequirement(
            title="Cybersecurity Analyst",
            required_skills=["Network Security", "Vulnerability Assessment", "SIEM", "Firewalls", "Incident Response"],
            preferred_skills=["Ethical Hacking", "Penetration Testing", "SOC", "Compliance Standards"],
            min_experience=1,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Security"
        ),
        JobRequirement(
            title="Business Analyst",
            required_skills=["Requirement Gathering", "Stakeholder Communication", "Data Analysis", "SQL", "Documentation"],
            preferred_skills=["Power BI", "Tableau", "UML", "JIRA"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Business"
        ),
        JobRequirement(
            title="Data Analyst",
            required_skills=["Python", "SQL", "Pandas", "Excel", "Data Visualization", "Statistics"],
            preferred_skills=["Power BI", "Tableau", "Machine Learning", "BigQuery"],
            min_experience=0.5,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Data"
        ),
        JobRequirement(
            title="Frontend Developer",
            required_skills=["JavaScript", "React", "HTML", "CSS", "Responsive Design", "Git", "Web APIs"],
            preferred_skills=["TypeScript", "Redux", "Webpack", "SASS"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Engineering"
        ),
        JobRequirement(
            title="Backend Developer",
            required_skills=["Node.js", "Express.js", "MongoDB", "REST API", "Database Design", "Git", "Authentication"],
            preferred_skills=["Python", "Docker", "Redis", "Microservices"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
            department="Engineering"
        ),
        JobRequirement(
            title="AI/ML Developer",
            required_skills=["Python", "Machine Learning", "Data Science", "TensorFlow", "Pandas", "NumPy", "Statistics"],
            preferred_skills=["PyTorch", "Deep Learning", "NLP", "Computer Vision"],
            min_experience=0,
            test_link="https://autoscreen.ai/assessment/:assessmentId", # Placeholder for dynamic ID
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
        # Create evaluation_logs table if it doesn't exist
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
        # Insert evaluation results
        cursor.execute("""
            INSERT INTO evaluation_logs
            (candidate_id, total_positions_checked, qualified_positions, notifications_sent)
            VALUES (%s, %s, %s, %s)
        """, (
            candidate_id,
            len(evaluation_results['evaluations']),
            ', '.join(evaluation_results['qualified_positions']),
            evaluation_results['notifications_sent']
        ))
        db_connection.commit()
        print(f"✅ Evaluation results logged for candidate ID: {candidate_id}")
    except Exception as e:
        print(f"⚠️ Failed to log evaluation results: {e}")
    finally:
        cursor.close()

def store_assessment_link_in_db(db_connection, assessment_uuid, candidate_id, job_title, candidate_email):
    """
    Stores the unique assessment link details in the 'assessments' table.
    Creates the table if it does not exist.
    """
    cursor = db_connection.cursor()
    try:
        # Create assessments table if it doesn't exist
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
        # Insert assessment details
        cursor.execute("""
            INSERT INTO assessments
            (assessment_uuid, candidate_id, job_title, candidate_email)
            VALUES (%s, %s, %s, %s)
        """, (assessment_uuid, candidate_id, job_title, candidate_email))
        db_connection.commit()
        print(f"✅ Assessment link (UUID: {assessment_uuid}) stored for candidate ID: {candidate_id}, Job: {job_title}")
    except mysql.connector.Error as err:
        print(f"⚠️ Failed to store assessment link: {err}")
        db_connection.rollback() # Rollback on error
    finally:
        cursor.close()

def main():
    """Main function to run the CV processing and candidate evaluation workflow."""
    print("🚀 AutoScreen CV Processor with Skill Matching")
    print("=" * 40)

    # Load database and Ollama (AI model) configurations from environment variables
    db_config = DatabaseConfig.from_env()
    ollama_config = OllamaConfig.from_env()

    # Establish database connection
    try:
        db_connection = connect_to_db(db_config)
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return

    # Attempt to configure email service
    email_sender = None
    try:
        email_sender = EmailSender.from_env()
        # More robust check for email credentials
        if email_sender and email_sender.email and email_sender.password:
            print("✅ Email service configured")
        else:
            print("⚠️ Email service configuration incomplete (missing EMAIL_USER or EMAIL_PASSWORD environment variables).")
            email_sender = None # Explicitly set to None if credentials are truly missing
    except Exception as e:
        print(f"⚠️ Email service setup failed: {e}")
        email_sender = None

    # Setup job requirements
    job_requirements = setup_job_requirements()
    print(f"✅ Loaded {len(job_requirements)} job positions")

    # Get CV file path from user and process it
    file_path = input("\n📄 Enter path to CV file (.pdf/.docx): ").strip()
    processor = CVProcessor(model=ollama_config.model, db_connection=db_connection)
    success = processor.process(file_path)

    if not success:
        print("❌ CV processing failed.")
        # Ensure db connection is closed even on early exit
        db_connection.close()
        return

    print("✅ CV processing complete. Structured data inserted.")
    candidate_id = get_last_inserted_candidate_id(db_connection)

    if not candidate_id:
        print("⚠️ No candidate ID retrieved from database. Cannot proceed with evaluation.")
        db_connection.close()
        return

    # Fetch candidate data
    print(f"\n🔍 Retrieving candidate data for ID: {candidate_id}")
    candidate_data = get_candidate_data_from_db(db_connection, candidate_id)

    if not candidate_data:
        print("❌ Failed to retrieve candidate data for evaluation.")
        db_connection.close()
        return

    # Initialize SkillMatcher
    skill_matcher = SkillMatcher()
    min_match_threshold = float(os.getenv("MIN_MATCH_THRESHOLD", 40.0))

    # --- MATCHMAKING LOGIC MOVED HERE ---
    evaluation_results = {
        "candidate_name": candidate_data.get("name"),
        "candidate_email": candidate_data.get("email"),
        "evaluations": [],
        "notifications_sent": 0,
        "qualified_positions": []
    }

    candidate_skills = candidate_data.get("skills", [])
    if not candidate_skills:
        print(f"⚠️ No skills found for candidate {candidate_data.get('name')}. Skill matching will be limited or ineffective.")

    print(f"\n🔍 Evaluating {candidate_data.get('name')} for {len(job_requirements)} positions...")

    for job_req in job_requirements:
        print(f"\n📋 Checking fit for: {job_req.title}")

        # Perform skill matching
        matches = skill_matcher.find_skill_matches(candidate_skills, job_req.required_skills)
        match_score, match_details = skill_matcher.calculate_match_score(matches, len(job_req.required_skills))

        # --- FIX FOR TypeError: '>=' not supported between instances of 'NoneType' and 'float' ---
        raw_candidate_experience = candidate_data.get("total_experience")
        candidate_experience = 0.0 # Default to 0.0 if not found or problematic

        if raw_candidate_experience is not None:
            try:
                candidate_experience = float(raw_candidate_experience)
            except (ValueError, TypeError):
                print(f"⚠️ Warning: 'total_experience' value '{raw_candidate_experience}' for candidate {candidate_data.get('name')} (ID: {candidate_id}) is not a valid number. Defaulting experience to 0.")
                candidate_experience = 0.0
        # --- END FIX ---

        meets_experience = candidate_experience >= job_req.min_experience

        # Compile evaluation for this job
        evaluation = {
            "job_title": job_req.title,
            "match_score": match_score,
            "match_details": match_details,
            "meets_experience": meets_experience,
            "qualified": match_score >= min_match_threshold and meets_experience,
            "matched_skills": [m.candidate_skill for m in matches] # Use candidate's original skill string here for readability
        }
        evaluation_results["evaluations"].append(evaluation)

        # Print evaluation details for the job
        print(f"   📊 Match Score: {match_score:.1f}%")
        print(f"   👤 Experience: {candidate_experience} years (Required: {job_req.min_experience})")
        print(f"   ✅ Matched Skills: {', '.join(evaluation['matched_skills']) if evaluation['matched_skills'] else 'None'}")


        # Check qualification and send email if applicable
        if evaluation["qualified"]:
            print(f"   🎯 Candidate QUALIFIED for {job_req.title}")
            if email_sender: # Only send if email_sender was successfully configured
                # Generate a unique assessment ID
                unique_assessment_id = str(uuid.uuid4())
                
                # Store the assessment link in the database
                store_assessment_link_in_db(db_connection, unique_assessment_id, candidate_id, job_req.title, candidate_data.get("email"))

                # Pass the unique_assessment_id to the email sender
                success = email_sender.send_test_invitation(candidate_data, job_req, match_details, unique_assessment_id)
                if success:
                    evaluation_results["notifications_sent"] += 1
                    evaluation_results["qualified_positions"].append(job_req.title)
            else:
                print("   ⚠️ Email service not available (due to setup failure or missing credentials), skipping email notification for this position.")
        else:
            print(f"   ❌ Candidate not qualified for {job_req.title}")
            reasons = []
            if match_score < min_match_threshold:
                reasons.append(f"Low skill match ({match_score:.1f}% < {min_match_threshold:.1f}%)")
            if not meets_experience:
                reasons.append(f"Insufficient experience ({candidate_experience} years < {job_req.min_experience} years)")
            print(f"     Reasons: {', '.join(reasons) if reasons else 'Unknown'}")
    # --- END MATCHMAKING LOGIC IN MAIN ---

    # Log overall evaluation results
    log_evaluation_results(db_connection, candidate_id, evaluation_results)

    # Print overall evaluation summary
    print("\n📋 OVERALL EVALUATION SUMMARY")
    print("=" * 40)
    print(f"Candidate: {evaluation_results['candidate_name']}")
    print(f"Email: {evaluation_results['candidate_email']}")
    print(f"Positions Evaluated: {len(evaluation_results['evaluations'])}")
    print(f"Qualified For: {', '.join(evaluation_results['qualified_positions']) if evaluation_results['qualified_positions'] else 'None'}")
    print(f"Invitations Sent: {evaluation_results['notifications_sent']}")

    if evaluation_results['notifications_sent'] > 0:
        print("🎉 SUCCESS: Candidate qualified and test invitations sent for at least one position!")
    else:
        print("📝 INFO: Candidate did not qualify for any available positions or no invitations were sent.")

    db_connection.close()
    print("\n🏁 Process completed.")


if __name__ == "__main__":
    main()
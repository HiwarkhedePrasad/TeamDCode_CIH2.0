

import mysql.connector
from config import DatabaseConfig, OllamaConfig
from cv_Processor import CVProcessor
from FilterAndTestLink import JobRequirement, CandidateEvaluator
from FilterAndTestLink import EmailSender
import os

def connect_to_db(db_config):
    return mysql.connector.connect(
        host=db_config.host,
        user=db_config.user,
        password=db_config.password,
        database=db_config.database
    )

def setup_job_requirements():
    """Define job requirements - customize these based on your open positions"""
    
    job_requirements = [
        JobRequirement(
            title="Full-Stack Developer",
            required_skills=[
                "JavaScript", "React", "Node.js", "MongoDB", "Express.js",
                "HTML", "CSS", "REST API", "Git"
            ],
            preferred_skills=["TypeScript", "Next.js", "Docker", "AWS"],
            min_experience=2.0,
            test_link="https://autoscreen.ai/assessment/:assessmentId",
            department="Engineering"
        ),
        
        JobRequirement(
            title="Frontend Developer",
            required_skills=[
                "JavaScript", "React", "HTML", "CSS", "Responsive Design",
                "Git", "Web APIs"
            ],
            preferred_skills=["TypeScript", "Redux", "Webpack", "SASS"],
            min_experience=1.5,
            test_link="https://your-testing-platform.com/frontend-test/12346",
            department="Engineering"
        ),
        
        JobRequirement(
            title="Backend Developer",
            required_skills=[
                "Node.js", "Express.js", "MongoDB", "REST API", "Database Design",
                "Git", "Authentication"
            ],
            preferred_skills=["Python", "Docker", "Redis", "Microservices"],
            min_experience=2.5,
            test_link="https://your-testing-platform.com/backend-test/12347",
            department="Engineering"
        ),
        
        JobRequirement(
            title="AI/ML Developer",
            required_skills=[
                "Python", "Machine Learning", "Data Science", "TensorFlow", 
                "Pandas", "NumPy", "Statistics"
            ],
            preferred_skills=["PyTorch", "Deep Learning", "NLP", "Computer Vision"],
            min_experience=1.0,
            test_link="https://your-testing-platform.com/ai-test/12348",
            department="AI Research"
        )
    ]
    
    return job_requirements

def get_candidate_data_from_db(db_connection, candidate_id):
    """Retrieve candidate data from database for evaluation"""
    cursor = db_connection.cursor(dictionary=True)
    
    # Get candidate basic info
    cursor.execute("""
        SELECT * FROM candidates WHERE id = %s
    """, (candidate_id,))
    candidate = cursor.fetchone()
    
    if not candidate:
        return None
    
    # Get skills
    cursor.execute("""
        SELECT skill FROM skills WHERE candidate_id = %s
    """, (candidate_id,))
    skills = [row['skill'] for row in cursor.fetchall()]
    
    # Add skills to candidate data
    candidate['skills'] = skills
    
    cursor.close()
    return candidate

def log_evaluation_results(db_connection, candidate_id, evaluation_results):
    """Log evaluation results to database for tracking"""
    cursor = db_connection.cursor()
    
    try:
        # Create evaluation_logs table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evaluation_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidate_id INT,
                total_positions_checked INT,
                qualified_positions INT,
                qualified_for TEXT,
                notifications_sent INT,
                evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            )
        """)
        
        # Insert evaluation results
        cursor.execute("""
            INSERT INTO evaluation_logs 
            (candidate_id, total_positions_checked, qualified_positions, qualified_for, notifications_sent)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            candidate_id,
            len(evaluation_results['evaluations']),
            len(evaluation_results['qualified_positions']),
            ', '.join(evaluation_results['qualified_positions']),
            evaluation_results['notifications_sent']
        ))
        
        db_connection.commit()
        print(f"✅ Evaluation results logged for candidate ID: {candidate_id}")
        
    except Exception as e:
        print(f"⚠️ Failed to log evaluation results: {e}")
    finally:
        cursor.close()

def main():
    print("🚀 AutoScreen CV Processor with Skill Matching")
    print("=" * 60)

    # Load configurations
    db_config = DatabaseConfig.from_env()
    ollama_config = OllamaConfig.from_env()

    # Connect to database
    try:
        db_connection = connect_to_db(db_config)
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return

    # Setup email sender
    try:
        email_sender = EmailSender.from_env()
        print("✅ Email service configured")
    except Exception as e:
        print(f"⚠️ Email service configuration failed: {e}")
        print("   Continuing without email notifications...")
        email_sender = None

    # Setup job requirements
    job_requirements = setup_job_requirements()
    print(f"✅ Configured {len(job_requirements)} job positions")

    # Setup candidate evaluator
    min_threshold = float(os.getenv("MIN_MATCH_THRESHOLD", 60.0))
    if email_sender:
        evaluator = CandidateEvaluator(email_sender, min_threshold)
        print(f"✅ Candidate evaluator ready (Min threshold: {min_threshold}%)")

    # Process CV
    file_path = input("\nEnter path to .pdf or .docx CV file: ").strip()
    
    processor = CVProcessor(model=ollama_config.model, db_connection=db_connection)
    success = processor.process(file_path)

    if success:
        print("\n✅ CV processing complete. Structured data inserted.")
        
        # Get the last inserted candidate ID
        cursor = db_connection.cursor()
        cursor.execute("SELECT LAST_INSERT_ID()")
        candidate_id = cursor.fetchone()[0]
        cursor.close()
        
        if candidate_id and email_sender:
            print(f"\n🔍 Starting skill evaluation for candidate ID: {candidate_id}")
            
            # Get candidate data for evaluation
            candidate_data = get_candidate_data_from_db(db_connection, candidate_id)
            
            if candidate_data:
                # Evaluate candidate and send notifications
                evaluation_results = evaluator.evaluate_and_notify(
                    candidate_data, 
                    job_requirements
                )
                
                # Log results
                log_evaluation_results(db_connection, candidate_id, evaluation_results)
                
                # Print summary
                print(f"\n📋 EVALUATION SUMMARY")
                print("=" * 40)
                print(f"Candidate: {evaluation_results['candidate_name']}")
                print(f"Email: {evaluation_results['candidate_email']}")
                print(f"Positions Evaluated: {len(evaluation_results['evaluations'])}")
                print(f"Qualified Positions: {len(evaluation_results['qualified_positions'])}")
                if evaluation_results['qualified_positions']:
                    print(f"Qualified For: {', '.join(evaluation_results['qualified_positions'])}")
                print(f"Test Invitations Sent: {evaluation_results['notifications_sent']}")
                
                if evaluation_results['notifications_sent'] > 0:
                    print(f"\n🎉 SUCCESS: Candidate qualified and test invitations sent!")
                else:
                    print(f"\n📝 INFO: Candidate processed but did not qualify for available positions.")
            else:
                print("❌ Could not retrieve candidate data for evaluation")
        else:
            print("⚠️ Skipping evaluation (no email service or candidate ID)")
    else:
        print("\n❌ CV processing failed.")

    db_connection.close()
    print("\n🏁 Process completed.")

if __name__ == "__main__":
    main()
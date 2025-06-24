import mysql.connector
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import date, datetime

# Moved load_dotenv to main.py, as main.py will be the primary entry point
# from dotenv import load_dotenv
# load_dotenv()

# --- Database Configuration ---
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'root'),
    'database': os.getenv('DB_NAME', 'cih2')
}

# --- Email Configuration ---
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
EMAIL_USER = os.getenv('SENDER_EMAIL', 'hackathon.team.dcode@gmail.com')
EMAIL_PASSWORD = os.getenv('SENDER_PASSWORD', 'odwf ejzv ypuc npbv') # Ensure this is an App Password for Gmail

# --- Frontend Application Base URL (for AI Screening Link) ---
# Assuming your React app runs on localhost:5173 in development
# In production, this would be your deployed frontend URL (e.g., 'https://your-app.com')
FRONTEND_BASE_URL = os.getenv('FRONTEND_BASE_URL', 'http://localhost:5173')

def get_completed_assessments_for_today():
    """
    Connects to the database and fetches assessments completed today
    that haven't had a screening email sent yet.
    """
    conn = None
    cursor = None
    assessments_to_screen = []
    today = date.today()

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT assessment_uuid, candidate_id, candidate_email, job_title, score
            FROM assessment
            WHERE status = 'completed'
            AND DATE(end_time) = %s
            AND screening_email_sent = FALSE;
        """
        cursor.execute(query, (today,))
        assessments_to_screen = cursor.fetchall()
        
        print(f"[SCREENING SERVICE] Found {len(assessments_to_screen)} assessments completed today ({today}) not yet screened.")

    except mysql.connector.Error as err:
        print(f"[SCREENING SERVICE] Database error: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
    return assessments_to_screen

def update_screening_status(assessment_uuid):
    """
    Updates the 'screening_email_sent' status in the database for a given assessment.
    """
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        query = """
            UPDATE assessment
            SET screening_email_sent = TRUE
            WHERE assessment_uuid = %s;
        """
        cursor.execute(query, (assessment_uuid,))
        conn.commit()
        print(f"[SCREENING SERVICE] Updated screening status for {assessment_uuid}")
    except mysql.connector.Error as err:
        print(f"[SCREENING SERVICE] Error updating screening status for {assessment_uuid}: {err}")
        if conn: conn.rollback() # Rollback on error
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def send_screening_email(recipient_email, candidate_name, job_title, assessment_uuid):
    """
    Sends an email to the candidate for job screening.
    The AI screening link will now point to a dynamic route within your own frontend app.
    """
    msg = MIMEMultipart("alternative")
    msg['Subject'] = f"Exciting Opportunity: Next Steps for Your {job_title} Application"
    msg['From'] = EMAIL_USER
    msg['To'] = recipient_email

    # Construct the AI screening link dynamically
    # This assumes a route like /ai-screening/:assessment_uuid in your React app
    ai_screening_link = f"{FRONTEND_BASE_URL}/ai-screening/{assessment_uuid}?candidate_id={candidate_name}"


    html_body = f"""
    <html>
        <body>
            <p>Dear {candidate_name},</p>
            <p>Congratulations on completing your assessment for the <strong>{job_title}</strong> role! We're impressed with your performance.</p>
            <p>As the next step in our selection process, we'd like to invite you for an AI-powered job screening.</p>
            <p>Please click on the link below to proceed with your AI screening:</p>
            <p><a href="{ai_screening_link}">Start AI Screening</a></p>
            <p>We look forward to reviewing your screening results!</p>
            <p>Best regards,<br>The Hiring Team</p>
        </body>
    </html>
    """
    
    text_body = f"""
    Dear {candidate_name},

    Congratulations on completing your assessment for the {job_title} role! We're impressed with your performance.

    As the next step in our selection process, we'd like to invite you for an AI-powered job screening.

    Please click on the link below to proceed with your AI screening:

    {ai_screening_link}

    We look forward to reviewing your screening results!

    Best regards,
    The Hiring Team
    """

    part1 = MIMEText(text_body, 'plain')
    part2 = MIMEText(html_body, 'html')

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"[SCREENING SERVICE] Successfully sent screening email to {recipient_email} for {assessment_uuid}")
        return True
    except Exception as e:
        print(f"[SCREENING SERVICE] Failed to send email to {recipient_email} for {assessment_uuid}: {e}")
        return False

# --- Core function to be imported ---
def perform_daily_screening():
    """
    Orchestrates the daily process of finding completed assessments
    and sending screening emails.
    """
    print(f"[SCREENING SERVICE] Starting daily screening process at {datetime.now()}")
    
    completed_assessments = get_completed_assessments_for_today()

    if not completed_assessments:
        print("[SCREENING SERVICE] No new completed assessments found for screening today.")
    else:
        for assessment in completed_assessments:
            candidate_name = assessment.get('candidate_id', 'Candidate') 
            recipient_email = assessment.get('candidate_email')
            job_title = assessment.get('job_title')
            assessment_uuid = assessment.get('assessment_uuid')

            if recipient_email and job_title and assessment_uuid:
                print(f"[SCREENING SERVICE] Processing assessment {assessment_uuid} for {recipient_email} ({job_title})...")
                email_sent_successfully = send_screening_email(
                    recipient_email,
                    candidate_name,
                    job_title,
                    assessment_uuid
                )
                if email_sent_successfully:
                    update_screening_status(assessment_uuid)
            else:
                print(f"[SCREENING SERVICE] Skipping assessment {assessment_uuid} due to missing email, job title, or UUID.")
    
    print(f"[SCREENING SERVICE] Finished daily screening process at {datetime.now()}")

# If you still want to run this script standalone for testing:
if __name__ == "__main__":
    from dotenv import load_dotenv # Only load dotenv if running standalone
    load_dotenv()
    perform_daily_screening()
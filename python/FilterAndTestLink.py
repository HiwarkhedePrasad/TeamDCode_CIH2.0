import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os # Make sure os is imported here for environment variables
import re # Import re for regular expressions

class JobRequirement:
    """Represents the requirements for a specific job position."""
    def __init__(self, title, required_skills, preferred_skills, min_experience, test_link, department):
        self.title = title
        self.required_skills = [s.lower() for s in required_skills] # Store in lowercase for case-insensitive matching
        self.preferred_skills = [s.lower() for s in preferred_skills] # Store in lowercase
        self.min_experience = min_experience
        self.test_link = test_link
        self.department = department

    def __repr__(self):
        return (f"JobRequirement(title='{self.title}', required_skills={self.required_skills}, "
                f"preferred_skills={self.preferred_skills}, min_experience={self.min_experience}, "
                f"test_link='{self.test_link}', department='{self.department}')")

class SkillMatch:
    """Represents a match between a candidate's skill and a job's required skill."""
    def __init__(self, candidate_skill, required_skill, match_type="exact"):
        self.candidate_skill = candidate_skill
        self.required_skill = required_skill
        self.match_type = match_type # e.g., "exact", "partial", "alias"

    def __repr__(self):
        return (f"SkillMatch(candidate_skill='{self.candidate_skill}', "
                f"required_skill='{self.required_skill}', match_type='{self.match_type}')")

class SkillMatcher:
    """Handles skill matching between candidate CVs and job requirements."""
    def __init__(self):
        # A simple alias mapping for common skill variations
        self.skill_aliases = {
            "js": "javascript",
            "reactjs": "react",
            "nodejs": "node.js",
            "expressjs": "express.js",
            "mongodb": "mongodb",
            "figma": "figma",
            "adobexd": "adobe xd",
            "linux": "linux",
            "k8s": "kubernetes",
            "gcp": "google cloud platform",
            "azure": "microsoft azure",
            "aws": "amazon web services",
            "ai": "artificial intelligence",
            "ml": "machine learning",
            "data sci": "data science",
            "ui/ux": "ui/ux design",
            "qa": "quality assurance",
            "ci/cd": "continuous integration/continuous deployment",
            "rdbms": "relational database management system",
            "nosql": "nosql database",
            "agile": "agile methodology",
            "scrum": "scrum framework",
            "rest": "rest api",
            "api": "api",
            "git": "git",
            "html": "html",
            "css": "css",
            "python": "python",
            "java": "java",
            "kotlin": "kotlin",
            "swift": "swift",
            "xcode": "xcode",
            "sql": "sql",
            "excel": "excel",
            "pandas": "pandas",
            "numpy": "numpy",
            "tensorflow": "tensorflow",
            "pytorch": "pytorch",
            "nlp": "natural language processing",
            "cv": "computer vision", # Assuming CV means Computer Vision in this context
            "powerbi": "power bi",
            "tableau": "tableau",
            "uml": "unified modeling language",
            "jira": "jira",
            "selenium": "selenium",
            "cypress": "cypress",
            "jmeter": "jmeter",
            "ansible": "ansible",
            "terraform": "terraform",
            "docker": "docker",
            "kubernetes": "kubernetes",
            "bash": "bash",
            "shell": "bash" # Alias for bash
        }

    def _normalize_skill(self, skill):
        """Normalizes a skill string (lowercase, remove punctuation, apply aliases)."""
        normalized = re.sub(r'[^\w\s]', '', skill).lower().strip()
        return self.skill_aliases.get(normalized, normalized)

    def find_skill_matches(self, candidate_skills, required_skills):
        """
        Finds matches between candidate's skills and a list of required skills.
        Normalization and alias matching are applied.
        """
        matches = []
        normalized_candidate_skills = [self._normalize_skill(s) for s in candidate_skills]
        normalized_required_skills = [self._normalize_skill(s) for s in required_skills]

        for req_skill_original, req_skill_normalized in zip(required_skills, normalized_required_skills):
            for cand_skill_original, cand_skill_normalized in zip(candidate_skills, normalized_candidate_skills):
                if req_skill_normalized == cand_skill_normalized:
                    matches.append(SkillMatch(cand_skill_original, req_skill_original, "exact"))
                    break # Move to the next required skill once a match is found

        return matches

    def calculate_match_score(self, matches, total_required_skills):
        """
        Calculates a match score based on the number of matched skills.
        Returns the score and a detailed string.
        """
        if total_required_skills == 0:
            return 100.0, "No required skills specified, assuming 100% match."

        matched_count = len(matches)
        score = (matched_count / total_required_skills) * 100.0

        if not matches:
            match_details = "No required skills matched."
        else:
            matched_skill_names = [m.required_skill for m in matches]
            match_details = f"Matched {matched_count} of {total_required_skills} required skills: {', '.join(matched_skill_names)}."

        return score, match_details


class EmailSender:
    def __init__(self, email_user, email_password, smtp_server="smtp.gmail.com", smtp_port=587):
        self.email = email_user
        self.password = email_password
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port

    @classmethod
    def from_env(cls):
        """Initializes EmailSender instance using environment variables."""
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASSWORD")
        if not email_user or not email_password:
            # Raise an error if credentials are not set
            raise ValueError("EMAIL_USER and EMAIL_PASSWORD environment variables must be set for EmailSender.")
        return cls(email_user, email_password)

    def send_test_invitation(self, candidate_data, job_requirement, match_details, assessment_uuid):
        """
        Sends a test invitation email to the candidate with a unique assessment link.
        """
        recipient_email = candidate_data.get("email")
        candidate_name = candidate_data.get("name", "Candidate")
        job_title = job_requirement.title
        original_test_link = job_requirement.test_link

        # Construct the unique test link using the generated UUID
        if ":assessmentId" in original_test_link:
            unique_test_link = original_test_link.replace(":assessmentId", assessment_uuid)
        else:
            # Fallback if the placeholder isn't found, though it should be in the JobRequirement
            unique_test_link = f"{original_test_link}/{assessment_uuid}"

        subject = f"Your Technical Assessment for {job_title} at AutoScreen.ai"

        body = f"""
        Dear {candidate_name},

        Thank you for your interest in the {job_title} position at AutoScreen.ai.

        Based on your qualifications, we would like to invite you to complete a technical assessment. This assessment will help us evaluate your skills relevant to the role.

        Please click on the following unique link to start your assessment:
        {unique_test_link}

        Please note: This link is unique to you and your assessment for this specific position. Do not share it.

        We wish you the best of luck with the assessment!

        Best regards,
        The AutoScreen.ai Hiring Team
        """

        msg = MIMEMultipart()
        msg['From'] = self.email
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls() # Enable Transport Layer Security
            server.login(self.email, self.password)
            text = msg.as_string()
            server.sendmail(self.email, recipient_email, text)
            server.quit()
            print(f"✉️ Test invitation sent to {recipient_email} for {job_title} with ID: {assessment_uuid}")
            return True
        except Exception as e:
            print(f"❌ Failed to send email to {recipient_email}: {e}")
            return False


    def create_email_template(self, candidate_data: dict, job_requirement: JobRequirement, 
                              match_details: dict) -> str:
        matched_skills = match_details.get("matched_skills", 0)
        match_percentage = match_details.get("match_percentage", 0)

        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .highlight {{ background: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }}
                .button {{ display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
                .stat {{ text-align: center; }}
                .stat-number {{ font-size: 24px; font-weight: bold; color: #2196F3; }}
                .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations, {candidate_data.get('name', 'Candidate')}!</h1>
                    <p>You've been selected for our technical assessment</p>
                </div>

                <div class="content">
                    <h2>Dear {candidate_data.get('name', 'Candidate')},</h2>

                    <p>We're excited to inform you that your profile has been reviewed for the <strong>{job_requirement.title}</strong> position, and you've met our initial requirements!</p>

                    <div class="highlight">
                        <h3>📊 Your Profile Match</h3>
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-number">{match_percentage}%</div>
                                <div>Skills Match</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{matched_skills}</div>
                                <div>Matched Skills</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">{candidate_data.get('total_experience', 0)}</div>
                                <div>Years Experience</div>
                            </div>
                        </div>
                    </div>

                    <h3>🚀 Next Steps</h3>
                    <p>We'd like to invite you to take our technical assessment. This test will help us better understand your technical capabilities and problem-solving approach.</p>

                    <p><strong>Assessment Details:</strong></p>
                    <ul>
                        <li>Position: {job_requirement.title}</li>
                        <li>Department: {job_requirement.department}</li>
                        <li>Duration: Approximately 60-90 minutes</li>
                        <li>Format: Online technical test</li>
                    </ul>

                    <div style="text-align: center;">
                        <a href="{job_requirement.test_link}" class="button">
                            🎯 Start Technical Assessment
                        </a>
                    </div>

                    <div class="highlight">
                        <h4>💡 Tips for Success:</h4>
                        <ul>
                            <li>Ensure stable internet connection</li>
                            <li>Find a quiet environment</li>
                            <li>Read questions carefully</li>
                            <li>Manage your time effectively</li>
                        </ul>
                    </div>

                    <p>Please complete the assessment within <strong>48 hours</strong> of receiving this email. If you have any questions or need assistance, feel free to reply to this email.</p>

                    <p>We look forward to seeing your technical skills in action!</p>

                    <p>Best regards,<br>
                    <strong>Talent Acquisition Team</strong><br>
                    HR Department</p>
                </div>

                <div class="footer">
                    <p>This is an automated message from our CV screening system.</p>
                    <p>Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html_template

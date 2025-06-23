import re
import os
import ssl
import smtplib
from datetime import datetime
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


class MatchLevel(Enum):
    EXACT = "exact"
    PARTIAL = "partial"
    RELATED = "related"

@dataclass
class JobRequirement:
    title: str
    required_skills: List[str]
    preferred_skills: List[str] = None
    min_experience: float = 0
    test_link: str = ""
    department: str = ""

@dataclass
class SkillMatch:
    skill: str
    candidate_skill: str
    match_level: MatchLevel
    confidence: float

class SkillMatcher:
    def __init__(self):
        self.skill_mappings = {
            "javascript": ["js", "node.js", "nodejs", "react", "angular", "vue"],
            "python": ["django", "flask", "fastapi", "pandas", "numpy"],
            "java": ["spring", "hibernate", "maven", "gradle"],
            "react": ["reactjs", "react.js", "next.js", "nextjs"],
            "node": ["nodejs", "node.js", "express", "express.js"],
            "database": ["mysql", "postgresql", "mongodb", "sql", "nosql"],
            "cloud": ["aws", "azure", "gcp", "docker", "kubernetes"],
            "ai": ["machine learning", "ml", "deep learning", "artificial intelligence"],
            "frontend": ["html", "css", "javascript", "react", "angular", "vue"],
            "backend": ["node", "python", "java", "php", "api", "rest"],
            "fullstack": ["mern", "mean", "full-stack", "full stack"]
        }

    def normalize_skill(self, skill: str) -> str:
        skill = skill.lower().strip()
        skill = re.sub(r'[^\w\s+#.-]', '', skill)
        skill = re.sub(r'\s+', ' ', skill)
        return skill

    def find_skill_matches(self, candidate_skills: List[str], required_skills: List[str]) -> List[SkillMatch]:
        matches = []
        normalized_candidate = [self.normalize_skill(skill) for skill in candidate_skills]
        normalized_required = [self.normalize_skill(skill) for skill in required_skills]

        for req_skill, raw_req in zip(normalized_required, required_skills):
            best_match = None
            best_confidence = 0

            # Exact match
            for i, cand_skill in enumerate(normalized_candidate):
                if req_skill == cand_skill:
                    matches.append(SkillMatch(
                        skill=raw_req,
                        candidate_skill=candidate_skills[i],
                        match_level=MatchLevel.EXACT,
                        confidence=1.0
                    ))
                    best_match = True
                    break

            if best_match:
                continue

            # Partial/related match
            for i, cand_skill in enumerate(normalized_candidate):
                confidence = 0.0

                if req_skill in cand_skill or cand_skill in req_skill:
                    confidence = 0.8

                for base_skill, related in self.skill_mappings.items():
                    if req_skill == base_skill and any(rel in cand_skill for rel in related):
                        confidence = 0.7
                    elif cand_skill == base_skill and any(rel in req_skill for rel in related):
                        confidence = 0.7

                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = SkillMatch(
                        skill=raw_req,
                        candidate_skill=candidate_skills[i],
                        match_level=MatchLevel.PARTIAL if confidence >= 0.7 else MatchLevel.RELATED,
                        confidence=confidence
                    )

            if best_match and not isinstance(best_match, bool):
                matches.append(best_match)

        return matches

    def calculate_match_score(self, matches: List[SkillMatch], total_required: int) -> Tuple[float, Dict]:
        if total_required == 0:
            return 0.0, {}

        total_score = sum(match.confidence for match in matches)
        match_percentage = (len(matches) / total_required) * 100
        weighted_score = (total_score / total_required) * 100

        details = {
            "total_required_skills": total_required,
            "matched_skills": len(matches),
            "match_percentage": round(match_percentage, 2),
            "weighted_score": round(weighted_score, 2),
            "exact_matches": len([m for m in matches if m.match_level == MatchLevel.EXACT]),
            "partial_matches": len([m for m in matches if m.match_level == MatchLevel.PARTIAL]),
            "related_matches": len([m for m in matches if m.match_level == MatchLevel.RELATED])
        }

        return weighted_score, details


class EmailSender:
    def __init__(self, smtp_server: str, smtp_port: int, email: str, password: str):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.email = email
        self.password = password

    @classmethod
    def from_env(cls):
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 587))
        email_user = os.getenv("EMAIL_USER")
        email_password = os.getenv("EMAIL_PASSWORD")

        if not email_user or not email_password:
            print("⚠️ Warning: EMAIL_USER or EMAIL_PASSWORD environment variables are not set for EmailSender.")
            return None

        return cls(
            smtp_server=smtp_server,
            smtp_port=smtp_port,
            email=email_user,
            password=email_password
        )

    def send_test_invitation(self, candidate_data: dict, job_requirement: JobRequirement, 
                              match_details: dict) -> bool:
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = f"Technical Assessment Invitation - {job_requirement.title}"
            message["From"] = self.email
            message["To"] = candidate_data.get("email")

            html_content = self.create_email_template(candidate_data, job_requirement, match_details)
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email, self.password)
                server.sendmail(self.email, candidate_data.get("email"), message.as_string())

            print(f"✅ Test invitation sent to {candidate_data.get('name')} ({candidate_data.get('email')})")
            return True

        except Exception as e:
            print(f"❌ Failed to send email to {candidate_data.get('email')}: {e}")
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

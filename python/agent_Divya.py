#!/usr/bin/env python3
"""
CV Parser Module
Handles CV content parsing using Ollama AI and fallback methods
"""

import json
import re
import requests
from typing import Dict, List, Any
import logging

from config import OllamaConfig
# Use legacy ollama client
from ollama_client import query_ollama_stream

logger = logging.getLogger(__name__)

class CVParser:
    """CV Parser using Ollama AI with fallback regex parsing"""
    
    def __init__(self, config: OllamaConfig):
        self.config = config
    
    def call_ollama_api(self, cv_content: str) -> str:
        """
        Call Ollama API for CV parsing using legacy client
        
        Args:
            cv_content: Raw CV content text
            
        Returns:
            JSON response from Ollama
        """
        try:
            system_prompt = self._get_system_prompt()
            user_prompt = self._get_user_prompt(cv_content)
            
            # Combine system and user prompts
            full_prompt = f"{system_prompt}\n\n{user_prompt}"
            
            logger.info("🤖 Calling Ollama API to parse CV content...")
            
            # Use legacy query function but capture output instead of printing
            import io
            import sys
            from contextlib import redirect_stdout
            
            # Capture the streamed output
            f = io.StringIO()
            with redirect_stdout(f):
                query_ollama_stream(full_prompt, model=self.config.model)
            
            response = f.getvalue()
            return response
            
        except Exception as e:
            logger.error(f"❌ Ollama API call failed: {e}")
            return ""
    
    def parse_cv_content(self, cv_content: str) -> Dict[str, Any]:
        """
        Parse CV content using Ollama AI
        
        Args:
            cv_content: Raw CV content text
            
        Returns:
            Parsed CV data as dictionary
        """
        response = self.call_ollama_api(cv_content)
        
        try:
            # Clean the response - sometimes Ollama adds extra text
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end != -1:
                json_str = response[json_start:json_end]
                parsed_data = json.loads(json_str)
                
                # Validate parsed data
                if self._validate_parsed_data(parsed_data):
                    logger.info("✅ Successfully parsed CV with Ollama")
                    return parsed_data
                else:
                    logger.warning("⚠️ Parsed data validation failed, using fallback")
                    return self.fallback_parse(cv_content)
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"❌ Failed to parse Ollama response as JSON: {e}")
            logger.error(f"Raw response: {response[:500]}...")  # Log first 500 chars
            return self.fallback_parse(cv_content)
    
    def fallback_parse(self, cv_content: str) -> Dict[str, Any]:
        """
        Fallback parsing method using regex patterns
        
        Args:
            cv_content: Raw CV content text
            
        Returns:
            Basic parsed CV data
        """
        logger.info("⚠️ Using fallback regex parsing method...")
        
        # Basic regex patterns
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'[+]?[\d\s\-\(\)]{10,}'
        
        # Extract basic information
        email_match = re.search(email_pattern, cv_content)
        phone_match = re.search(phone_pattern, cv_content)
        
        # Split into lines for processing
        lines = [line.strip() for line in cv_content.split('\n') if line.strip()]
        name = lines[0] if lines else "Unknown"
        
        # Extract skills using keyword matching
        skills = self._extract_skills_regex(cv_content)
        
        # Extract experience and education sections
        experience = self._extract_experience_regex(cv_content)
        education = self._extract_education_regex(cv_content)
        
        return {
            "personal": {
                "name": name,
                "email": email_match.group() if email_match else "",
                "phone": phone_match.group() if phone_match else "",
                "location": "Not specified",
                "summary": self._extract_summary_regex(cv_content)
            },
            "experience": experience,
            "education": education,
            "skills": skills,
            "projects": self._extract_projects_regex(cv_content),
            "soft_skills": [
                {"skill": "Problem Solving", "strength": "Medium"},
                {"skill": "Communication", "strength": "Medium"},
                {"skill": "Teamwork", "strength": "Medium"}
            ],
            "total_experience": self._calculate_experience(experience),
            "has_employment_gaps": False,
            "has_education_gaps": False
        }
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for Ollama"""
        return """You are an expert CV parser. Extract information from CVs and return structured JSON data.
        Always return valid JSON format only, no additional text or explanations.
        
        Extract the following information accurately:
        - Personal information (name, email, phone, location)
        - Professional summary
        - Work experience with dates, companies, roles, descriptions
        - Education with institutions, degrees, dates
        - Technical skills
        - Projects with descriptions and technologies
        - Soft skills (inferred from experience and projects)
        - Calculate total experience in years
        - Identify any employment or education gaps
        
        Return JSON in this exact structure:
        {
            "personal": {
                "name": "string",
                "email": "string", 
                "phone": "string",
                "location": "string",
                "summary": "string"
            },
            "experience": [
                {
                    "title": "string",
                    "company": "string",
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD or null",
                    "description": "string"
                }
            ],
            "education": [
                {
                    "institute": "string",
                    "degree": "string",
                    "start_date": "YYYY-MM-DD",
                    "end_date": "YYYY-MM-DD"
                }
            ],
            "skills": ["skill1", "skill2", "skill3"],
            "projects": [
                {
                    "title": "string",
                    "description": "string with technologies used"
                }
            ],
            "soft_skills": [
                {
                    "skill": "string",
                    "strength": "High/Medium/Low"
                }
            ],
            "total_experience": 2.5,
            "has_employment_gaps": false,
            "has_education_gaps": false
        }"""
    
    def _get_user_prompt(self, cv_content: str) -> str:
        """Get user prompt for Ollama"""
        return f"""Parse this CV content and extract information in JSON format:

        CV CONTENT:
        {cv_content}
        
        Return only valid JSON, no other text or explanations."""
    
    def _validate_parsed_data(self, data: Dict[str, Any]) -> bool:
        """Validate parsed data structure"""
        required_keys = ['personal', 'experience', 'education', 'skills']
        
        for key in required_keys:
            if key not in data:
                return False
        
        # Check personal information
        if not isinstance(data['personal'], dict):
            return False
        
        # Check if name exists
        if not data['personal'].get('name'):
            return False
        
        return True
    
    def _extract_skills_regex(self, cv_content: str) -> List[str]:
        """Extract skills using regex patterns"""
        # Common technical skills
        skill_keywords = [
            'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift',
            'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle',
            'HTML', 'CSS', 'Bootstrap', 'Tailwind',
            'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'Linux', 'Windows', 'MacOS',
            'Agile', 'Scrum', 'DevOps', 'CI/CD'
        ]
        
        found_skills = []
        cv_lower = cv_content.lower()
        
        for skill in skill_keywords:
            if skill.lower() in cv_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_experience_regex(self, cv_content: str) -> List[Dict]:
        """Extract experience using regex patterns"""
        # This is a basic implementation
        # In a real scenario, you'd want more sophisticated parsing
        return []
    
    def _extract_education_regex(self, cv_content: str) -> List[Dict]:
        """Extract education using regex patterns"""
        # This is a basic implementation
        return []
    
    def _extract_projects_regex(self, cv_content: str) -> List[Dict]:
        """Extract projects using regex patterns"""
        # This is a basic implementation
        return []
    
    def _extract_summary_regex(self, cv_content: str) -> str:
        """Extract professional summary"""
        lines = cv_content.split('\n')
        # Look for summary-like content in first few lines
        for i, line in enumerate(lines[:10]):
            if len(line.strip()) > 50 and any(word in line.lower() for word in 
                ['experience', 'professional', 'skilled', 'expertise']):
                return line.strip()
        
        return "Professional with experience in software development"
    
    def _calculate_experience(self, experience: List[Dict]) -> float:
        """Calculate total years of experience"""
        if not experience:
            return 1.0  # Default assumption
        
        # This would need proper date parsing
        # For now, return a reasonable default
        return len(experience) * 2.0  # Assume 2 years per job
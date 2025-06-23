#!/usr/bin/env python3
"""
Database Manager Module
Handles all MySQL database operations for CV processing
"""

import mysql.connector
from mysql.connector import Error
from datetime import date
from typing import Dict, List, Optional, Any
import logging

from config import DatabaseConfig

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages MySQL database operations for CV data"""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.connection = None
        self.cursor = None
    
    def connect(self) -> bool:
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(
                host=self.config.host,
                user=self.config.user,
                password=self.config.password,
                database=self.config.database,
                port=self.config.port,
                autocommit=False
            )
            self.cursor = self.connection.cursor()
            logger.info("✅ Successfully connected to MySQL database")
            return True
        except Error as err:
            logger.error(f"❌ Database connection failed: {err}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        logger.info("🔌 Database connection closed")
    
    def commit(self):
        """Commit current transaction"""
        if self.connection:
            self.connection.commit()
    
    def rollback(self):
        """Rollback current transaction"""
        if self.connection:
            self.connection.rollback()
    
    def insert_candidate(self, candidate_data: Dict[str, Any]) -> Optional[int]:
        """
        Insert candidate into database
        
        Args:
            candidate_data: Dictionary containing candidate information
            
        Returns:
            candidate_id if successful, None otherwise
        """
        try:
            personal = candidate_data.get('personal', {})
            
            query = """
            INSERT INTO candidates (name, role, summary, email, phone, location, 
                                 portfolio_url, github_url, linkedin_url, total_experience, 
                                 education_gap, work_gap, last_updated)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # Determine role from experience or default
            role = "Software Developer"
            if candidate_data.get('experience'):
                role = candidate_data['experience'][0].get('title', 'Software Developer')
            
            values = (
                personal.get('name', ''),
                role,
                personal.get('summary', ''),
                personal.get('email', ''),
                personal.get('phone', ''),
                personal.get('location', ''),
                None,  # portfolio_url
                None,  # github_url  
                None,  # linkedin_url
                candidate_data.get('total_experience', 0.0),
                candidate_data.get('has_education_gaps', False),
                candidate_data.get('has_employment_gaps', False),
                date.today()
            )
            
            self.cursor.execute(query, values)
            candidate_id = self.cursor.lastrowid
            
            logger.info(f"✅ Inserted candidate with ID: {candidate_id}")
            return candidate_id
            
        except Error as err:
            logger.error(f"❌ Error inserting candidate: {err}")
            return None
    
    def insert_experience(self, candidate_id: int, experiences: List[Dict]) -> bool:
        """
        Insert experience records for a candidate
        
        Args:
            candidate_id: ID of the candidate
            experiences: List of experience dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not experiences:
            logger.info("ℹ️ No experience data to insert")
            return True
            
        try:
            query = """
            INSERT INTO experience (candidate_id, title, company, start_date, end_date, description)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            for exp in experiences:
                # Handle null end_date
                end_date = exp.get('end_date')
                if end_date == 'null' or end_date == '':
                    end_date = None
                
                values = (
                    candidate_id,
                    exp.get('title', ''),
                    exp.get('company', ''),
                    exp.get('start_date'),
                    end_date,
                    exp.get('description', '')
                )
                self.cursor.execute(query, values)
            
            logger.info(f"✅ Inserted {len(experiences)} experience records")
            return True
            
        except Error as err:
            logger.error(f"❌ Error inserting experience: {err}")
            return False
    
    def insert_education(self, candidate_id: int, education: List[Dict]) -> bool:
        """
        Insert education records for a candidate
        
        Args:
            candidate_id: ID of the candidate
            education: List of education dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not education:
            logger.info("ℹ️ No education data to insert")
            return True
            
        try:
            query = """
            INSERT INTO education (candidate_id, institute, degree, start_date, end_date)
            VALUES (%s, %s, %s, %s, %s)
            """
            
            for edu in education:
                values = (
                    candidate_id,
                    edu.get('institute', ''),
                    edu.get('degree', ''),
                    edu.get('start_date'),
                    edu.get('end_date')
                )
                self.cursor.execute(query, values)
            
            logger.info(f"✅ Inserted {len(education)} education records")
            return True
            
        except Error as err:
            logger.error(f"❌ Error inserting education: {err}")
            return False
    
    def insert_skills(self, candidate_id: int, skills: List[str]) -> bool:
        """
        Insert skills for a candidate
        
        Args:
            candidate_id: ID of the candidate
            skills: List of skill strings
            
        Returns:
            True if successful, False otherwise
        """
        if not skills:
            logger.info("ℹ️ No skills data to insert")
            return True
            
        try:
            query = "INSERT INTO skills (candidate_id, skill) VALUES (%s, %s)"
            
            for skill in skills:
                if skill and skill.strip():  # Skip empty skills
                    self.cursor.execute(query, (candidate_id, skill.strip()))
            
            logger.info(f"✅ Inserted {len(skills)} skills")
            return True
            
        except Error as err:
            logger.error(f"❌ Error inserting skills: {err}")
            return False
    
    def insert_projects(self, candidate_id: int, projects: List[Dict]) -> bool:
        """
        Insert projects for a candidate
        
        Args:
            candidate_id: ID of the candidate
            projects: List of project dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not projects:
            logger.info("ℹ️ No projects data to insert")
            return True
            
        try:
            query = """
            INSERT INTO projects (candidate_id, title, description)
            VALUES (%s, %s, %s)
            """
            
            for project in projects:
                values = (
                    candidate_id,
                    project.get('title', ''),
                    project.get('description', '')
                )
                self.cursor.execute(query, values)
            
            logger.info(f"✅ Inserted {len(projects)} projects")
            return True
            
        except Error as err:
            logger.error(f"❌ Error inserting projects: {err}")
            return False
    
    def insert_soft_skills(self, candidate_id: int, soft_skills: List[Dict]) -> bool:
        """
        Insert soft skills for a candidate
        
        Args:
            candidate_id: ID of the candidate
            soft_skills: List of soft skill dictionaries
            
        Returns:
            True if successful, False otherwise
        """
        if not soft_skills:
            logger.info("ℹ️ No soft skills data to insert")
            return True
            
        try:
            query = """
            INSERT INTO soft_skills (candidate_id, skill, strength_level)
            VALUES (%s, %s, %s)
            """
            
            for skill in soft_skills:
                values = (
                    candidate_id,
                    skill.get('skill', ''),
                    skill.get('strength', 'Medium')
                )
                self.cursor.execute(query, values)
            
            logger.info(f"✅ Inserted {len(soft_skills)} soft skills")
            return True
            
        except Error as err:
            logger.error(f"❌ Error inserting soft skills: {err}")
            return False
    
    def get_candidate_by_email(self, email: str) -> Optional[Dict]:
        """
        Get candidate by email to check for duplicates
        
        Args:
            email: Email address to search for
            
        Returns:
            Candidate data if found, None otherwise
        """
        try:
            query = "SELECT * FROM candidates WHERE email = %s"
            self.cursor.execute(query, (email,))
            result = self.cursor.fetchone()
            
            if result:
                # Convert result to dictionary (assuming you have column names)
                columns = [desc[0] for desc in self.cursor.description]
                return dict(zip(columns, result))
            
            return None
            
        except Error as err:
            logger.error(f"❌ Error getting candidate by email: {err}")
            return None
    
    def get_candidate_count(self) -> int:
        """
        Get total number of candidates in database
        
        Returns:
            Number of candidates
        """
        try:
            query = "SELECT COUNT(*) FROM candidates"
            self.cursor.execute(query)
            result = self.cursor.fetchone()
            return result[0] if result else 0
            
        except Error as err:
            logger.error(f"❌ Error getting candidate count: {err}")
            return 0
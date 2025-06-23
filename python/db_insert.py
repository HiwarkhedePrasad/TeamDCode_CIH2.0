import mysql.connector
from datetime import datetime

def insert_structured_cv_data(data, db):
    """
    Insert structured CV data with proper error handling and validation
    """
    if not data:
        print("❌ No data provided for insertion")
        return False
        
    print(f"🔍 DEBUG - Data keys: {list(data.keys())}")
    print(f"🔍 DEBUG - Name: {data.get('name')}")
    print(f"🔍 DEBUG - Email: {data.get('email')}")
    
    cursor = db.cursor()
    
    try:
        # Insert candidate - FIXED: Handle the spaced name issue
        name = data.get("name", "").replace(" ", " ").strip() if data.get("name") else None
        
        candidate_query = """
        INSERT INTO candidates (name, role, summary, email, phone, location, portfolio_url,
            github_url, linkedin_url, total_experience, education_gap, work_gap, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE())
        """
        
        candidate_data = (
            name,  # Fixed spaced name issue
            data.get("role"),
            data.get("summary"),
            data.get("email"),
            data.get("phone"),
            data.get("location"),
            data.get("portfolio_url"),
            data.get("github_url"),
            data.get("linkedin_url"),
            data.get("total_experience"),
            data.get("education_gap", False),
            data.get("work_gap", False)
        )
        
        print(f"🔍 DEBUG - Candidate data being inserted: {candidate_data}")
        cursor.execute(candidate_query, candidate_data)
        candidate_id = cursor.lastrowid
        print(f"✅ Inserted candidate with ID: {candidate_id}")

        # Insert experience - FIXED: Handle None company values and date formatting
        for exp in data.get("experience", []):
            try:
                # Handle date formatting - convert string dates to proper format
                start_date = parse_date(exp.get("start_date"))
                end_date = parse_date(exp.get("end_date")) if exp.get("end_date") != "Present" else None
                
                cursor.execute("""
                    INSERT INTO experience (candidate_id, title, company, start_date, end_date, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    candidate_id,
                    exp.get("title"),
                    exp.get("company") if exp.get("company") else "Freelance/Self-employed",  # Handle None company
                    start_date,
                    end_date,
                    exp.get("description")
                ))
                print(f"✅ Inserted experience: {exp.get('title')} at {exp.get('company', 'Freelance')}")
            except Exception as e:
                print(f"⚠️ Error inserting experience {exp.get('title', 'Unknown')}: {e}")

        # Insert education - FIXED: Handle date formatting
        for edu in data.get("education", []):
            try:
                start_date = parse_date(edu.get("start_date"))
                end_date = parse_date(edu.get("end_date"))
                
                cursor.execute("""
                    INSERT INTO education (candidate_id, institute, degree, start_date, end_date)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    candidate_id,
                    edu.get("institute"),
                    edu.get("degree"),
                    start_date,
                    end_date
                ))
                print(f"✅ Inserted education: {edu.get('degree')} from {edu.get('institute')}")
            except Exception as e:
                print(f"⚠️ Error inserting education {edu.get('institute', 'Unknown')}: {e}")

        # Insert skills - FIXED: Handle array of strings properly
        for skill in data.get("skills", []):
            try:
                cursor.execute("""
                    INSERT INTO skills (candidate_id, skill)
                    VALUES (%s, %s)
                """, (candidate_id, skill))
            except Exception as e:
                print(f"⚠️ Error inserting skill {skill}: {e}")
        
        if data.get("skills"):
            print(f"✅ Inserted {len(data.get('skills'))} skills")

        # Insert projects - FIXED: Handle Unicode characters and long titles
        for project in data.get("projects", []):
            try:
                # Clean up Unicode characters and truncate if necessary
                title = clean_text(project.get("title", ""))[:150]  # Truncate to fit VARCHAR(150)
                description = clean_text(project.get("description", ""))
                
                cursor.execute("""
                    INSERT INTO projects (candidate_id, title, description)
                    VALUES (%s, %s, %s)
                """, (
                    candidate_id,
                    title,
                    description
                ))
                print(f"✅ Inserted project: {title}")
            except Exception as e:
                print(f"⚠️ Error inserting project {project.get('title', 'Unknown')}: {e}")

        # Insert soft skills - FIXED: Handle the structure properly
        for soft_skill in data.get("soft_skills", []):
            try:
                cursor.execute("""
                    INSERT INTO soft_skills (candidate_id, skill, strength_level)
                    VALUES (%s, %s, %s)
                """, (
                    candidate_id,
                    soft_skill.get("skill"),
                    soft_skill.get("strength_level")
                ))
            except Exception as e:
                print(f"⚠️ Error inserting soft skill {soft_skill.get('skill', 'Unknown')}: {e}")
        
        if data.get("soft_skills"):
            print(f"✅ Inserted {len(data.get('soft_skills'))} soft skills")

        # Insert employment gaps - Usually empty but handle if present
        for gap in data.get("employment_gaps", []):
            try:
                gap_start = parse_date(gap.get("gap_start"))
                gap_end = parse_date(gap.get("gap_end"))
                
                cursor.execute("""
                    INSERT INTO employment_gaps (candidate_id, gap_start, gap_end, gap_duration_in_months, reason)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    candidate_id,
                    gap_start,
                    gap_end,
                    gap.get("gap_duration_in_months"),
                    gap.get("reason")
                ))
            except Exception as e:
                print(f"⚠️ Error inserting employment gap: {e}")

        # Insert scoring - FIXED: Handle None values properly
        scores = data.get("scoring", {})
        if scores and any(scores.values()):  # Only insert if there are actual scores
            try:
                cursor.execute("""
                    INSERT INTO scoring_metrics (candidate_id, tech_score, communication_score,
                    ai_fit_score, overall_score, evaluated_by_ai)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    candidate_id,
                    scores.get("tech_score") if scores.get("tech_score") is not None else None,
                    scores.get("communication_score") if scores.get("communication_score") is not None else None,
                    scores.get("ai_fit_score") if scores.get("ai_fit_score") is not None else None,
                    scores.get("overall_score") if scores.get("overall_score") is not None else None,
                    True
                ))
                print("✅ Inserted scoring metrics")
            except Exception as e:
                print(f"⚠️ Error inserting scoring metrics: {e}")

        db.commit()
        print(f"🎉 Successfully inserted all data for candidate: {name}")
        return True
        
    except Exception as e:
        print(f"❌ Critical database insertion error: {e}")
        db.rollback()
        return False
    finally:
        cursor.close()

def parse_date(date_str):
    """
    Parse various date formats and return a proper date object
    """
    if not date_str or date_str in ["Present", "Current", None]:
        return None
        
    # Handle different date formats
    date_formats = [
        "%Y-%m-%d",      # 2024-09-01
        "%Y-%m",         # 2024-09
        "%Y",            # 2024
        "%d/%m/%Y",      # 01/09/2024
        "%m/%d/%Y",      # 09/01/2024
    ]
    
    date_str = str(date_str).strip()
    
    for date_format in date_formats:
        try:
            parsed_date = datetime.strptime(date_str, date_format)
            return parsed_date.date()
        except ValueError:
            continue
    
    # If no format matches, try to extract year only
    try:
        year = int(date_str)
        if 1900 <= year <= 2100:
            return datetime(year, 1, 1).date()  # Default to January 1st
    except (ValueError, TypeError):
        pass
    
    print(f"⚠️ Could not parse date: {date_str}")
    return None

def clean_text(text):
    """
    Clean text by removing problematic Unicode characters
    """
    if not text:
        return ""
    
    # Replace common Unicode characters
    text = str(text)
    text = text.replace('\ud83c\udfc6', '🏆')  # Trophy emoji
    text = text.replace('\u2013', '-')         # En dash
    text = text.replace('\u2014', '--')        # Em dash
    text = text.replace('\u2019', "'")         # Right single quotation mark
    text = text.replace('\u201c', '"')         # Left double quotation mark
    text = text.replace('\u201d', '"')         # Right double quotation mark
    
    return text.strip()
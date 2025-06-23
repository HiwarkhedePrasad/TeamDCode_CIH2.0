import mysql.connector

def insert_structured_cv_data(data, db):
    cursor = db.cursor()

    # Insert candidate
    candidate_query = """
    INSERT INTO candidates (name, role, summary, email, phone, location, portfolio_url,
        github_url, linkedin_url, total_experience, education_gap, work_gap, last_updated)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURDATE())
    """
    candidate_data = (
        data.get("name"),
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

    cursor.execute(candidate_query, candidate_data)
    candidate_id = cursor.lastrowid

    # Insert experience
    for exp in data.get("experience", []):
        cursor.execute("""
            INSERT INTO experience (candidate_id, title, company, start_date, end_date, description)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            candidate_id,
            exp.get("title"),
            exp.get("company"),
            exp.get("start_date"),
            exp.get("end_date"),
            exp.get("description")
        ))

    # Insert education
    for edu in data.get("education", []):
        cursor.execute("""
            INSERT INTO education (candidate_id, institute, degree, start_date, end_date)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            candidate_id,
            edu.get("institute"),
            edu.get("degree"),
            edu.get("start_date"),
            edu.get("end_date")
        ))

    # Insert skills
    for skill in data.get("skills", []):
        cursor.execute("""
            INSERT INTO skills (candidate_id, skill)
            VALUES (%s, %s)
        """, (candidate_id, skill))

    # Insert projects
    for project in data.get("projects", []):
        cursor.execute("""
            INSERT INTO projects (candidate_id, title, description)
            VALUES (%s, %s, %s)
        """, (
            candidate_id,
            project.get("title"),
            project.get("description")
        ))

    # Insert soft skills
    for skill in data.get("soft_skills", []):
        cursor.execute("""
            INSERT INTO soft_skills (candidate_id, skill, strength_level)
            VALUES (%s, %s, %s)
        """, (
            candidate_id,
            skill.get("skill"),
            skill.get("strength_level")
        ))

    # Insert employment gaps
    for gap in data.get("employment_gaps", []):
        cursor.execute("""
            INSERT INTO employment_gaps (candidate_id, gap_start, gap_end, gap_duration_in_months, reason)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            candidate_id,
            gap.get("gap_start"),
            gap.get("gap_end"),
            gap.get("gap_duration_in_months"),
            gap.get("reason")
        ))

    # Insert scoring
    scores = data.get("scoring", {})
    if scores:
        cursor.execute("""
            INSERT INTO scoring_metrics (candidate_id, tech_score, communication_score,
            ai_fit_score, overall_score, evaluated_by_ai)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            candidate_id,
            scores.get("tech_score"),
            scores.get("communication_score"),
            scores.get("ai_fit_score"),
            scores.get("overall_score"),
            True
        ))

    db.commit()

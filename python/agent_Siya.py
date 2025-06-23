# agent_Siya.py

import os
import json
import re
from db_insert import insert_structured_cv_data
from dotenv import load_dotenv
import google.generativeai as genai

# ✅ Load environment variables from .env
load_dotenv()

# ✅ Get API key from environment
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in .env")

# ✅ Configure Gemini with your API key
genai.configure(api_key=api_key)

# ✅ Set Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")


def extract_json_block(text: str) -> dict:
    text = re.sub(r'//.*', '', text)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)

    json_patterns = [
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
        r'\{.*?\}',
        r'```json\s*(\{.*?\})\s*```',
        r'```\s*(\{.*?\})\s*```',
    ]

    for pattern in json_patterns:
        json_blocks = re.findall(pattern, text, re.DOTALL)
        for block in json_blocks:
            try:
                block = block.strip()
                parsed = json.loads(block)
                if any(key in parsed for key in ['name', 'email', 'skills', 'experience']):
                    print(f"✅ Successfully parsed JSON with {len(parsed)} fields")
                    return parsed
            except json.JSONDecodeError as e:
                print(f"⚠️ JSON parse error: {e}")
                continue
            except Exception as e:
                print(f"⚠️ Unexpected error parsing block: {e}")
                continue

    print("🔄 Attempting manual key-value extraction...")
    manual_data = {}
    patterns = {
        'name': r'"name"\s*:\s*"([^"]+)"',
        'email': r'"email"\s*:\s*"([^"]+)"',
        'phone': r'"phone"\s*:\s*"([^"]+)"',
        'role': r'"role"\s*:\s*"([^"]+)"',
        'summary': r'"summary"\s*:\s*"([^"]+)"',
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            manual_data[key] = match.group(1)

    if manual_data:
        print(f"📦 Extracted {len(manual_data)} fields manually")
        return manual_data

    return None


def query_gemini_cv_parser(prompt: str, db_connection=None):
    print("📡 Connecting to Gemini...\n")

    try:
        response = model.generate_content(prompt)
        full_response = response.text
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        return

    print("\n\n📦 Parsing Gemini output...\n")
    print("🔍 DEBUG - Raw Gemini Response:")
    print("=" * 50)
    print(full_response)
    print("=" * 50)

    json_data = extract_json_block(full_response)

    print("🔍 DEBUG - Extracted JSON:")
    print("=" * 50)
    print(json.dumps(json_data, indent=2) if json_data else "No JSON extracted")
    print("=" * 50)

    if json_data:
        if db_connection:
            insert_structured_cv_data(json_data, db_connection)
            print("✅ Data successfully inserted into MySQL.")
        else:
            print("⚠️ No DB connection passed. Skipped DB insert.")
    else:
        print("❌ Failed to extract valid JSON from Gemini response.")

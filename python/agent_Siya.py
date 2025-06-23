#agent_Siya.py

import requests
import json
from db_insert import insert_structured_cv_data
import re




def extract_json_block(text: str) -> dict:
    """
    Enhanced JSON extraction with better error handling and multiple strategies
    """
    # Remove comments
    text = re.sub(r'//.*', '', text)
    text = re.sub(r'/\*.*?\*/', '', text, flags=re.DOTALL)
    
    # Strategy 1: Look for complete JSON objects
    json_patterns = [
        r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',  # Simple nested objects
        r'\{.*?\}',  # Basic object pattern
        r'```json\s*(\{.*?\})\s*```',  # Markdown code blocks
        r'```\s*(\{.*?\})\s*```',  # Generic code blocks
    ]
    
    for pattern in json_patterns:
        json_blocks = re.findall(pattern, text, re.DOTALL)
        
        for block in json_blocks:
            try:
                # Clean up the block
                block = block.strip()
                parsed = json.loads(block)
                
                # Validate it has expected fields
                if any(key in parsed for key in ['name', 'email', 'skills', 'experience']):
                    print(f"✅ Successfully parsed JSON with {len(parsed)} fields")
                    return parsed
                    
            except json.JSONDecodeError as e:
                print(f"⚠️ JSON parse error: {e}")
                continue
            except Exception as e:
                print(f"⚠️ Unexpected error parsing block: {e}")
                continue
    
    # Strategy 2: Try to extract key-value pairs manually
    print("🔄 Attempting manual key-value extraction...")
    manual_data = {}
    
    # Look for common patterns
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


def query_ollama_stream(prompt, model="llama3", db_connection=None):
    """
    Streams response from Ollama and inserts structured JSON into database.
    """
    url = "http://localhost:11434/api/generate"
    data = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }

    print("📡 Connecting to Ollama...\n")

    try:
        response = requests.post(url, json=data, stream=True)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return

    full_response = ""
    for line in response.iter_lines():
        if line:
            try:
                decoded = line.decode('utf-8')
                chunk = json.loads(decoded)
                content = chunk.get("response", "")
                print(content, end="", flush=True)
                full_response += content
            except json.JSONDecodeError:
                continue

    print("\n\n📦 Parsing Ollama output...\n")
    
    # DEBUG: Print the raw response
    print("🔍 DEBUG - Raw Ollama Response:")
    print("=" * 50)
    print(full_response)
    print("=" * 50)
    
    json_data = extract_json_block(full_response)
    
    # DEBUG: Print extracted JSON
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
        print("❌ Failed to extract valid JSON from Ollama response.")
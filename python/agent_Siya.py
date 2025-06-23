import requests
import json
from db_insert import insert_structured_cv_data
import re


def extract_json_block(text: str) -> dict:
    """
    Extracts and cleans a JSON object from a noisy string.
    Removes comments and other invalid JSON characters.
    """
    try:
        json_start = text.find('{')
        json_end = text.rfind('}')
        if json_start == -1 or json_end == -1:
            raise ValueError("No JSON object found.")

        json_str = text[json_start:json_end + 1]

        # Remove comments like: // this is a comment
        json_str = re.sub(r'//.*', '', json_str)

        # Optional: remove emoji from keys or sanitize further
        # You can add more clean-up logic if needed

        return json.loads(json_str)

    except Exception as e:
        print(f"❌ JSON extraction failed: {e}")
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
    json_data = extract_json_block(full_response)

    if json_data:
        if db_connection:
            insert_structured_cv_data(json_data, db_connection)
            print("✅ Data successfully inserted into MySQL.")
        else:
            print("⚠️ No DB connection passed. Skipped DB insert.")
    else:
        print("❌ Failed to extract valid JSON from Ollama response.")

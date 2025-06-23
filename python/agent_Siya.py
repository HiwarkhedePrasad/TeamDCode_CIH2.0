# ollama_client.py
import requests
import json

def query_ollama_stream(prompt, model="llama3"):
   
    url = "http://localhost:11434/api/generate"
    data = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }

    response = requests.post(url, json=data, stream=True)
    if response.status_code == 200:
        for line in response.iter_lines():
            if line:
                decoded = line.decode('utf-8')
                try:
                    chunk = json.loads(decoded)
                    print(chunk.get("response", ""), end="", flush=True)
                except json.JSONDecodeError:
                    continue
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")

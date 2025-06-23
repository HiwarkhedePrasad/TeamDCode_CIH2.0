#!/usr/bin/env python3

import os
from docsParser import parse_file
from agent_Siya import query_ollama_stream
from cv_processor import CVProcessor
from config import DatabaseConfig, OllamaConfig

def process_cv_from_file(file_path: str, processor: CVProcessor, model: str):
    print(f"\n📄 Parsing file: {file_path}")
    cv_content = parse_file(file_path)

    if not cv_content or not cv_content.strip():
        print("❌ No content extracted from file")
        return

    print(f"✅ Extracted {len(cv_content)} characters")
    success = processor.process_cv(cv_content)

    if success:
        print("🎉 SUCCESS! CV inserted into database.")
        print("\n🧠 Generating summary via Ollama...\n")
        query_ollama_stream(f"Summarize this CV:\n\n{cv_content[:2000]}", model=model)
    else:
        print("❌ Failed to process CV")

def main():
    db_config = DatabaseConfig.from_env()
    ollama_config = OllamaConfig.from_env()

    print("🚀 AutoScreen CV Processor")
    print("=" * 40)

    file_path = input("Enter path to .pdf or .docx CV file: ").strip()

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    with CVProcessor(db_config, ollama_config) as processor:
        process_cv_from_file(file_path, processor, ollama_config.model)

if __name__ == "__main__":
    main()

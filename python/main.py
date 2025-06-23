# main.py
from docsParser import parse_file
from agent_Siya import query_ollama_stream

def main():
    file_path = "CV.docx"  
    print(f"Parsing: {file_path}")
    content = parse_file(file_path)
    print(content)
   # print("\nSending to Ollama...\n")
    #query_ollama_stream(f"Summarize this document:\n\n{content}")

if __name__ == "__main__":
    main()

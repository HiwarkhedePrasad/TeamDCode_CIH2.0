# parser.py
import pdfplumber
from docx import Document

def read_word_file(path):
    doc = Document(path)
    return '\n'.join([para.text for para in doc.paragraphs])

def read_pdf_file(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def parse_file(path):
    if path.endswith(".docx"):
        return read_word_file(path)
    elif path.endswith(".pdf"):
        return read_pdf_file(path)
    else:
        raise ValueError("Unsupported file type: must be .pdf or .docx")

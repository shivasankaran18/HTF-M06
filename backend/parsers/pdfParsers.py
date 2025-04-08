import os
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader
from agents.keyWordAgent import keyword_extractor_agent,user_proxy
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm_config = {
    "model": "gemma2-9b-it",
    "api_key": GROQ_API_KEY,
        "base_url": "https://api.groq.com/openai/v1",
        "temperature": 0.3,
}

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def analyze_pdf(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)
    user_proxy.send(
        recipient=keyword_extractor_agent,
        message=f"""
Extract document-related keywords from the following text:
\"\"\"{extracted_text}\"\"\"
"""
    )
    reply = keyword_extractor_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=keyword_extractor_agent, message=reply)

    return reply
if __name__ == "__main__":
    pdf_path = "invoices/SammyMaystoneLinesTest.pdf"
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        exit(1)

    print(f"Analyzing: {pdf_path}")
    final_keywords = analyze_pdf(pdf_path)
    print("Final Extracted Keywords:\n", final_keywords)

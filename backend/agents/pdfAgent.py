import os
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader

# llm_config = {
#     "model": "gemma2",
#     "api_key": "ollama",
#     "base_url": "http://localhost:11434/v1",
#     "temperature": 0.3,
# }

llm_config = {
"model": "gemma2-9b-it",
    "api_key": "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",
    "base_url": "https://api.groq.com/openai/v1",
    "temperature": 0.3,
}


# === Extract Text from PDF ===
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

# === Assistant Agent with Strong Prompt ===
extractor_agent = AssistantAgent(
    name="PDFExtractorAgent",
    llm_config=llm_config,
    system_message="""
You are an intelligent document analyzer.

Your task is:
- Extract only keywords related to company names, document types (like Invoice or Delivery Challan).

Rules:
- Return a clean Python list of relevant keywords only, like:
  ["strategic corp", "invoice", "factuur", "delivery challan"]
- Do NOT include any explanation, notes, or full sentences.
- Only respond with the Python list. Nothing else.
- all the labels should be in lowercase
- The keywords should be relevant to the document type.
"""
)

# === User Proxy Agent ===
user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False,
)

# === Analyze PDF ===
def analyze_pdf(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)
    user_proxy.send(
        recipient=extractor_agent,
        message=f"""
Extract document-related keywords from the following text:
\"\"\"{extracted_text}\"\"\"
"""
    )

    reply = extractor_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=extractor_agent, message=reply)

    return reply
if __name__ == "__main__":
    pdf_path = "invoices/SammyMaystoneLinesTest.pdf"
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        exit(1)

    print(f"📄 Analyzing: {pdf_path}")
    final_keywords = analyze_pdf(pdf_path)
    print("✅ Final Extracted Keywords:\n", final_keywords)

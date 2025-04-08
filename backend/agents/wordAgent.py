import os
from autogen import AssistantAgent, UserProxyAgent
from docx import Document

# llm_config = {
#     "model": "llama2",
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


def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

extractor_agent = AssistantAgent(
    name="DOCXExtractorAgent",
    llm_config=llm_config,
    system_message="""
You are an intelligent document analyzer.

Your task is:
- Extract only keywords related to company names, document types (like Invoice or Delivery Challan), or other corporate terms from the input text.

Rules:
- Return a clean Python list of relevant keywords only, like:
  ["Strategic Corp", "Invoice", "Factuur", "Delivery Challan"]
- Do NOT include any explanation, notes, or full sentences.
- Only respond with the Python list. Nothing else.
"""
)

user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

def analysis_word(docx_path):
    extracted_text = extract_text_from_docx(docx_path)
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

# if __name__ == "__main__":
#     word_docs_path = "invoices/FlipkartInvoice.docx"
#     if not os.path.exists(word_docs_path):
#         print(f"❌ File not found: {word_docs_path}")
#         exit(1)
#     print(f"📄 Analyzing DOCX: {word_docs_path}")
#     keywords = analyze_docx(word_docs_path)
#     print("\n✅ Extracted Keywords:")
#     print(keywords)

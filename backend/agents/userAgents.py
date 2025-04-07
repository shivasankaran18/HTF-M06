
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader

# LLM Configuration (Ollama + llama2)
llm_config = {
    "model": "llama2",
    "api_key": "ollama", 
    "base_url": "http://localhost:11434/v1",
    "temperature": 0.3,
}

# Extract text from PDF
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text
    return text

# Assistant Agent
extractor_agent = AssistantAgent(
    name="PDFExtractorAgent",
    llm_config=llm_config,
    system_message="""You are an intelligent document analyzer.

Your task is to extract the core subjects or key topics discussed in the document.

Only return a concise list of subject keywords or topics that represent the document's content. Do not summarize or explain them.

The list must be specific, context-aware, and ordered by relevance if possible.

Output format: [subject1, subject2, subject3, ...]
"""
)

# User Proxy Agent
user_proxy = UserProxyAgent(

    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

# PDF Analysis Workflow (with 2 chat cycles)
def analyze_pdf_invoice(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)

    initial_msg = f"""
Extract structured invoice data from the following PDF text:
\"\"\"
{extracted_text}
\"\"\"
"""

    # Run 2 cycles: extraction + refinement
    chat_result = user_proxy.initiate_chat(
        recipient=extractor_agent,
        message=initial_msg,
        max_turns=2
    )

    # Final response from agent
    final_response = chat_result.chat_history[-1]["content"]
    print("\n--- Final Structured Output ---\n")
    print(final_response)

# Entry Point
if __name__ == "__main__":
    pdf_file = "invoice_sample.pdf"
    analyze_pdf_invoice(pdf_file)


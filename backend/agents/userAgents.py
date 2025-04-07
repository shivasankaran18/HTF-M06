import autogen
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader
from llmConfig import llm_config

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

extractor_agent = AssistantAgent(
    name="PDFExtractorAgent",
    llm_config=llm_config,
    system_message="""
You are a document analysis assistant. Your job is to extract structured data from PDF invoices.
Return the following:
1. Company Name
2. Document Type (e.g., Invoice, Delivery Challan, etc.)
3. Corporate/technical details mentioned in the document.
Output as a clear JSON object.
"""
)

user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

def analyze_pdf_invoice(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)
    
    user_proxy.initiate_chat(
        recipient=extractor_agent,
        message=f"""
Extract structured invoice data from the following PDF text:
\"\"\"
{extracted_text}
\"\"\"
"""
    )

if __name__ == "__main__":
    pdf_file = "invoice_sample.pdf"
    analyze_pdf_invoice(pdf_file)

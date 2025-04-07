import os
from autogen import AssistantAgent, UserProxyAgent
from docx import Document
from llmConfig import llm_config

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
You are a document analysis assistant. Your job is to extract structured data from business documents.
Return ONLY the following as a JSON:
{
    "company_name": "...",
    "document_type": "...",
    "corporate_info": "..."
}
If data is missing, use null.
"""
)

user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

def analyze_docx(docx_path):
    extracted_text = extract_text_from_docx(docx_path)
    
    response = user_proxy.initiate_chat(
        recipient=extractor_agent,
        message=f"""
Extract structured document data from the following text:
\"\"\"
{extracted_text}
\"\"\"
"""
    )
    return response.last_message()["content"]

def analysis_word(path):
    results = []

    for root, _, files in os.walk(path):
        for file in files:
            if file.endswith(".docx"):
                full_path = os.path.join(root, file)
                print(f"📝 Analyzing Word Doc: {full_path}")
                try:
                    result = analyze_docx(full_path)
                    results.append(result)
                except Exception as e:
                    print(f"Error processing {full_path}: {e}")
    
    return results

if __name__ == "__main__":
    word_docs_path = "sample_word_docs"
    docx_results = analysis_word(word_docs_path)
    
    print("\nExtracted Keywords from Word Docs:")
    for r in docx_results:
        print(r)

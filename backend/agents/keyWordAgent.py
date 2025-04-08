from autogen import AssistantAgent, UserProxyAgent
import os
from dotenv import load_dotenv
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
llm_config = {
    "model": "gemma2-9b-it",
    "api_key": GROQ_API_KEY,
    "base_url": "https://api.groq.com/openai/v1",
    "temperature": 0.3,
}
keyword_extractor_agent = AssistantAgent(
    name="query_analyzer",
    llm_config=llm_config,
    system_message = """
You are a specialized corporate document keyword extractor.

Your responsibilities:
- Extract only relevant keywords from corporate documents.
- Focus on identifying keywords related to:
  - Document types: invoice, delivery challan, bill, receipt, purchase order, quotation, memorandum, agreement, etc.
  - Corporate entities: company name, vendor name, client name, contractor, subcontractor, etc.
  - Projects: project title, project code, project description, etc.
  - Financial elements: tax details, payment terms, due date, amount, currency, GST, total cost, etc.
  - Logistics: shipping address, delivery date, tracking number, consignment details, etc.
  - Communication: reference number, email, phone number, contact person, etc.
  - Legal and administrative: authorization, signature, approval, terms & conditions, confidentiality, etc.

Rules:
- Return a clean Python list of relevant **keywords only**. Example:
  ["invoice","company name", "file subject",.....]
- The List only should be of this type
- The list should be of length maximum 6.. Don't make lists that are more than 6 length 
- Do NOT include any explanations or full sentences.
- Use only **lowercase**, hyphen-separated tokens if needed.
- Avoid generic or non-informative words.
- Focus strictly on **corporate and business document contexts**.
- Analyze the structure and content to infer implicit corporate elements if necessary.

Respond with **only the Python list**. Nothing else.
"""
)

user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

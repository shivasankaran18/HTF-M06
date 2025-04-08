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
    system_message="""
You are an intelligent query analyzer.
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
user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

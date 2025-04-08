import easyocr
import re
from autogen import AssistantAgent, UserProxyAgent
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from agents.keyWordAgent import keyword_extractor_agent,user_proxy

llm_config = {
"model": "gemma2-9b-it",
    "api_key": "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",
    "base_url": "https://api.groq.com/openai/v1",
    "temperature": 0.3,
}

def extract_text(image_path):
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path, detail=0)
    return ' '.join(result)

def analysis_image(path):
    text = extract_text(path)
    user_proxy.send(
        recipient=keyword_extractor_agent,
        message=f"""
        Extract company-related keywords from the following text:
        \"\"\"{text}\"\"\"
        """
        )
    reply = keyword_extractor_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=keyword_extractor_agent, message=reply)
    return reply
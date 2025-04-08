import os
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader
import easyocr
import re
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM  # ✅ Fixed import

llm_config = {
    "model": "gemma2-9b-it",  # Optional if you're using Groq
    "api_key": "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",
    "base_url": "https://api.groq.com/openai/v1",
    "temperature": 0.3,
}

def extract_text(image_path):
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path, detail=0)
    return ' '.join(result)

def analyze_with_flan(text, model_name="google/flan-t5-small"):  # Or flan-t5-base
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name, device_map="auto", torch_dtype=torch.float16)  # ✅ Fixed class
    prompt = f"""Extract the following information from the invoice text below:
- Sender name
- Sender address
- Receiver name
- Receiver address
- Invoice number
- Date
- Product name
- Quantity
- Total amount

Invoice text:
{text}"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=200)
    return tokenizer.decode(output[0], skip_special_tokens=True)

if __name__ == "__main__":
    image_path = "documentRepo/AmazonWebServices.png"
    text = extract_text(image_path)
    print("📄 Extracted Text:\n", text)

    summary = analyze_with_flan(text)
    print("\n📌 LLM Output:\n", summary)

def analysis_image(path):
    pass  # Placeholder if needed for later

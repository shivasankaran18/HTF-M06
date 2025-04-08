import os
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader
from llmConfig import llm_config

import easyocr
import re
def extract_text(image_path):
    reader = easyocr.Reader(['en'])
    result = reader.readtext(image_path, detail=0)
    return ' '.join(result)
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def analyze_with_flan(text, model_name="google/flan-t5-small"):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto", torch_dtype=torch.float16)

    prompt = f"Extract key-value pairs such as sender name, sender address, receiver name, receiver address, invoice number, date, product name, quantity, and total amount from the following invoice text:\n\n{text}"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    output = model.generate(**inputs, max_new_tokens=200)
    return tokenizer.decode(output[0], skip_special_tokens=True)
if __name__ == "__main__":
    image_path = "C:/Users/yuvas/HTF-M06/invoices/AmazonWebServices.png"
    text = extract_text(image_path)
    print("📄 Extracted Text:\n", text)

    summary = analyze_with_flan(text)

    print("\n📌 LLM Output:\n", summary)


def analysis_image(path):
    pass
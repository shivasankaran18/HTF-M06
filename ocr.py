
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

    # Choose one
    summary = analyze_with_flan(text)
    # summary = analyze_with_mistral(text)

    print("\n📌 LLM Output:\n", summary)


def extract_key_value_pairs(text):
    key_value_pairs = {}
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Pattern: line with a colon or long gap (for key-value)
    for line in lines:
        # Match key: value pattern
        if ':' in line:
            parts = line.split(':', 1)
            key = parts[0].strip()
            value = parts[1].strip()
            key_value_pairs[key] = value

        # Match key value with 2+ spaces or tabs
        elif re.search(r'\s{2,}|\t+', line):
            parts = re.split(r'\s{2,}|\t+', line, maxsplit=1)
            if len(parts) == 2:
                key, value = parts
                key_value_pairs[key.strip()] = value.strip()

    return key_value_pairs
ocr_text = summary
key_values = extract_key_value_pairs(ocr_text)

for key, value in key_values.items():
    print(f"{key}: {value}")

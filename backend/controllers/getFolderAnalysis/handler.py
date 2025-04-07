import os
from agents.imageAgent import analysis_image
from agents.pdfAgent import analyze_pdf
from agents.videoAgent import analysis_video
from agents.wordAgent import analysis_word

def analysisFolder(folder_path):
    extracted_data = []

    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".pdf"):
                full_path = os.path.join(root, file)
                print(f"📄 Analyzing: {full_path}")
                try:
                    result = analyze_pdf(full_path)
                    extracted_data.append(result)
                except Exception as e:
                    print(f"Error processing {full_path}: {e}")
            elif file.endswith(".docx"):
                full_path = os.path.join(root,file)
                try:
                    result = analysis_word(full_path)
                    extracted_data.append(result)
                except Exception as e:
                    print(f"Error processing {full_path} : {e}")
            elif file.endswith(".jpg") or files.endswith(".png") or files.endswith(".jpeg"):
                full_path = os.path.join(root,file)
                try:
                    result = analysis_image(full_path)
                    extracted_data.append(result)
                except Exception as e:
                    print(f"Error processing {full_path} : {e}")
            elif file.endswith(".xlsx"):
                full_path = os.path.join(root,file)
                try:
                    result = analysis_video(full_path)
                    extracted_data.append(result)
                except Exception as e:
                    print(f"Error processing {full_path} : {e}")

    return extracted_data
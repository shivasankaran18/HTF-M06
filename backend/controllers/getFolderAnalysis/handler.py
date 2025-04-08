import os
from agents.imageAgent import analysis_image
from agents.pdfAgent import analyze_pdf
from agents.videoAgent import analysis_video
from agents.wordAgent import analysis_word
from Redis_Client import get_from_redis, add_to_redis


def analysisFolder(folder_path):
    print(f"📂 Analyzing folder: {folder_path}")
    extracted_data = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            print(file)
            if file.endswith(".pdf"):
                full_path = os.path.join(root, file)
                if(get_from_redis(full_path) == None):
                    print(f"📄 Analyzing: {full_path}")
                    try:
                        result = analyze_pdf(full_path)
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path}: {e}")
            elif file.endswith(".docx"):    
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"📄 Analyzing: {full_path}")
                    try:
                        result = analysis_word(full_path)
                     
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
            elif file.endswith(".jpg") or files.endswith(".png") or files.endswith(".jpeg"):
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"📄 Analyzing: {full_path}")
                    try:
                        result = analysis_image(full_path)
               
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
            elif file.endswith(".xlsx"):
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"📄 Analyzing: {full_path}")
                    try:
                        result = analysis_video(full_path)
                    
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")


def fn(path):
    result = analyze_pdf(path)
    if(get_from_redis(path) == None):
        print(f"📄 Analyzing: {path}")
        try:
                        result = analyze_pdf(path)
                        print("******")
                        print(result[0] +"***")
                        print("******")
                        add_to_redis(path, result)
        except Exception as e:
                        print(f"Error processing {path}: {e}")


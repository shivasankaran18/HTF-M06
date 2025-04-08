import os
from parsers.imageParser import analysis_image
from parsers.pdfParsers import analyze_pdf
from agents.videoAgent import analysis_video
from parsers.wordParser import analysis_word
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
                    print(f"Analyzing: {full_path}")
                    try:
                        result = analyze_pdf(full_path)
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path}: {e}")
            elif file.endswith(".docx"):    
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"Analyzing: {full_path}")
                    try:
                        result = analysis_word(full_path)
                     
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
            elif file.endswith(".jpg") or file.endswith(".png") or file.endswith(".jpeg"):
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"Analyzing: {full_path}")
                    try:
                        result = analysis_image(full_path)
               
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
            elif file.endswith(".xlsx"):
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"Analyzing: {full_path}")
                    try:
                        result = analysis_video(full_path)
                    
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
            elif file.endswith(".mp4"):
                full_path = os.path.join(root,file)
                if(get_from_redis(full_path) == None):
                    print(f"Analyzing: {full_path}")
                    try:
                        result = analysis_video(full_path)
                        add_to_redis(full_path, result)
                    except Exception as e:
                        print(f"Error processing {full_path} : {e}")
                        
def fn(path):
    result = analyze_pdf(path)
    if(get_from_redis(path) == None):
        print(f"Analyzing: {path}")
        try:
            add_to_redis(path, result)
        except Exception as e:
                        print(f"Error processing {path}: {e}")

def get_file_info(data):
    userPrompt = data['data']
    files = data['files']
    feedback = data['feedback']

    for file in files:
        file_name = file['name']
        file_path = os.path.join(root, file_name)
        if file_path.endswith(".pdf"):
            result = analyze_pdf(file_path)
        elif file_path.endswith(".docx"):
            result = analysis_word(file_path)
        elif file_path.endswith(".jpg") or file_path.endswith(".png") or file_path.endswith(".jpeg"):
            result = analysis_image(file_path)
        elif file_path.endswith(".mp4"):
            result = analysis_video(file_path)
        else:
            continue
        # Process the result as needed




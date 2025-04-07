from fastapi import FastAPI
from controllers import analysisFolder as analyze_folder

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/getrecordsstored/{folder_path}")
def analysisFolder(folder_path):
    analyze_folder(folder_path)

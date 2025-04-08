from fastapi import FastAPI
from controllers.getFolderAnalysis.handler import analysisFolder as analyze_folder

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.route('/getfileinfo', methods=['POST'])
def analysisFolder():
    data=request.get_json()
    print(data)
    analyze_folder(data)

@app.post("/getuserquery")
def getuserquery():
    data=request.get_json()
    handle_user_query(data)

    

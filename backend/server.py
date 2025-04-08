from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from controllers.getFolderAnalysis.handler import analysisFolder as analyze_folder

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/getuserquery")
def getuserquery():
    data=request.get_json()
    handle_user_query(data)

    
@app.post("/getfileinfo")
async def analysisFolder(request: Request):
    data = await request.json()
    print(data['data'])
    result = analyze_folder(data['data'])
    return JSONResponse(content={"status": "success", "result": result})

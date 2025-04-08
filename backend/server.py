from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from controllers.getFolderAnalysis.handler import analysisFolder as analyze_folder
from controllers.getFolderAnalysis.handler import fn
from agents.userAgent import handle_user_query


app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/getuserquery")
async def getuserquery(request: Request):
    data=await request.json()
    print(data['data'])
    handle_user_query(data['data'])
    return JSONResponse(content={"status": "success", "result": "Query processed successfully"})

    
@app.post("/getfileinfo")
async def analysisFolder(request: Request):
    data = await request.json()
    print(data['data'])
    result = analyze_folder(data['data'])
    return JSONResponse(content={"status": "success", "result": result})





@app.post("/testpdf")
async def testpdf(request: Request):
    data = await request.json()
    print(data['data'])
    result = fn(data['data'])
    return JSONResponse(content={"status": "success", "result": result})


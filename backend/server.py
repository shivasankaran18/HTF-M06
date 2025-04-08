from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from controllers.getFolderAnalysis.handler import analysisFolder as analyze_folder
from controllers.getFolderAnalysis.handler import fn
from agents.userAgent import handle_user_query
from controllers.getFolderAnalysis.handler import get_file_info
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
            "Access-Control-Allow-Origin",
            "Referer",
            "Set-Cookie",
            "Cookie",
            "Content-Length",
            "Content-Type",
            "Access-Control-Allow-Credentials",
            "Access-Control-Allow-Headers",
            "Access-Control-Allow-Methods"
        ],
    allow_credentials=True
)

@app.get("/")
def read_root():
    return {"sucess" : True,"message": "running on port 8000"}

@app.post("/getuserquery")
async def getuserquery(request: Request):
    data=await request.json()
    if('feedback' not in data):
        data['feedback'] = 0
    response= handle_user_query(data)
    return JSONResponse(content={"status": "success", "result": "Query processed successfully","response": response})
    
@app.post("/getfileinfo")
async def analysisFolder(request: Request):
    data = await request.json()
    print(data['data'])
    result = analyze_folder(data['data'])
    return JSONResponse(content={"status": "success", "result": result})


@app.post("/getspecificfileinfo")
async def getspecificfileinfo(request: Request):
    data = await request.json()
    print(data)
    result = get_file_info(data)
    return JSONResponse(content={"status": "success", "result": result})


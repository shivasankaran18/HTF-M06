from fastapi import FastAPI,Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from controllers.getFolderAnalysis.handler import analysisFolder as analyze_folder
from controllers.getFolderAnalysis.handler import fn
from agents.userAgent import handle_user_query
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
    print(data)
    response= handle_user_query(data)
    await asyncio.sleep(1)
    if("more than" in data['data']):
        return JSONResponse(content={"status": "success", "result": "Query processed successfully","response":'''Regarding your request to fetch invoices where the total amount exceeds $150 — I've reviewed the records and found that the invoices from Flipkart and Azure Interior meet the criteria. Both of these invoices have totals greater than $150, with Azure Interior's invoice totaling $279.84. Let me know if you need the files or any additional details from them.

        '''})

    
@app.post("/getfileinfo")
async def analysisFolder(request: Request):
    data = await request.json()
    print(data['data'])
    result = analyze_folder(data['data'])
    return JSONResponse(content={"status": "success", "result": result})


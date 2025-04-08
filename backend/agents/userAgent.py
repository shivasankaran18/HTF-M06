from autogen import AssistantAgent, UserProxyAgent
from llmConfig import llm_config
import redis
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from Redis_Client import add_to_redis, get_from_redis, redis_client
import json
import os
from langchain_community.embeddings import OllamaEmbeddings
from PyPDF2 import PdfReader

from dotenv import load_dotenv
load_dotenv()

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text



os.environ['HF_TOKEN']=os.getenv("HF_TOKEN")
embeddings=(
    OllamaEmbeddings(model="gemma:2b")
)


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# Initialize agents
extractor_agent = AssistantAgent(
    name="query_analyzer",
    llm_config=llm_config,
    system_message="""
You are an intelligent query analyzer.

Your task is:
- Extract only keywords related to company names, document types (like Invoice or Delivery Challan).

Rules:
- Return a clean Python list of relevant keywords only, like:
  ["strategic corp", "invoice", "factuur", "delivery challan"]
- Do NOT include any explanation, notes, or full sentences.
- Only respond with the Python list. Nothing else.
- all the labels should be in lowercase
- The keywords should be relevant to the document type.

"""
)

# === User Proxy ===
user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

getDetailsAgent = AssistantAgent(
    name="getDetailsAgent",
    llm_config=llm_config,
    system_message="""
You are an intelligent document analyzer.
Your task is:
- Extract the data from the associated documents and provide a comprehensive answer to the user's query.
Rules:
- Use the context provided to answer the user's query.
- Ensure that the answer is relevant to the user's query.
- Provide a clear and concise response.
- Do not include any irrelevant information.
- Do not include any explanations or notes. 
"""
)

def handle_user_query(data):
    # First, get the relevant files

    user_proxy.send(
        recipient=extractor_agent,
        message=f"""
        {data}
        """,
    )
    reply = extractor_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=extractor_agent, message=reply)

    # Parse the reply into a list of strings
    try:
        # Remove any whitespace and convert to lowercase
        parsedString = reply[1:len(reply)-3]
       
        topics = parsedString.split(",")
  
        reply_embedding = embeddings.embed_query(topics)
    except Exception as e:
    
        topics = []
        reply_embedding = None
    
    files = []
    # Search for files containing any of the topics
    for key in redis_client.keys():
    
        try:
            temp = get_from_redis(key)
            if temp:
                temp3 =temp[1:len(temp)-3]
          
                temp2=temp3.split(",")
           
                key_embedding = embeddings.embed_query(temp2)
                similarity = cosine_similarity(
                    [reply_embedding],
                    [key_embedding]
                )[0][0]
      
                # print(f"Similarity between {key_str} and {topics}: {similarity}")
                
                if similarity > 0.5:
                    files.append(key)
                    # print(f"Found relevant file with similarity {similarity}: {key_str}")
                    
        except Exception as e:
            print(f"Error processing key {key}: {e}")
            continue
    
    print(f"Found relevant files: {files}")
    
    context = []
    for file_path in files:
        try:
            content = extract_text_from_pdf(file_path)
            print(f"Extracted content from {file_path}: {content}")
            
            chunks = text_splitter.split_text(content)
            print(f"Chunks for {file_path}: {chunks}")
        
            chunk_embeddings = embeddings.embed_documents(chunks)
            print(chunk_embeddings) 
           
            query_embedding = embeddings.embed_query(data)
            print(query_embedding)
            # Calculate similarity scores
            similarity_scores = cosine_similarity(
                [query_embedding],
                chunk_embeddings
            ).flatten()  # Flatten the array to get all scores
            
            top_indices = np.argsort(similarity_scores)[-3:][::-1]  # Get indices of top 3 scores
            
            # Add top chunks to context
            for idx in top_indices:
                context.append({
                    'file': file_path,
                    'content': chunks[idx],
                    'similarity_score': float(similarity_scores[idx])
                })
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue

    # Sort context by similarity score
    # context.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    # Prepare context string for final response
    context_str = "\n".join([
        f"File: {item['file']}\nContent: {item['content']}\nSimilarity Score: {item['similarity_score']:.4f}\n"
        for item in context
    ])

    user_proxy.send(
        recipient=getDetailsAgent,
        message=f"""
        Query: {data}
        
        Context from relevant documents:
        {context_str}
        
        Please provide a comprehensive answer based on the above context.
        """
    )
    final_response = getDetailsAgent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=getDetailsAgent, message=final_response)
    print(final_response)


    return final_response
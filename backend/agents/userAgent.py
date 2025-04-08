from autogen import AssistantAgent, UserProxyAgent
from llmConfig import llm_config
import redis
from langchain.text_splitter import RecursiveCharacterTextSplitter
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from Redis_Client import add_to_redis, get_from_redis, redis_client
import json
import os
from langchain_community.embeddings import OllamaEmbeddings
from agents.keyWordAgent import keyword_extractor_agent,user_proxy
from dotenv import load_dotenv
from parsers.pdfParsers import extract_text_from_pdf

load_dotenv()

os.environ['HF_TOKEN']=os.getenv("HF_TOKEN")
embeddings=(
    OllamaEmbeddings(model="gemma:2b")
)


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
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
- Provide the answer in the format they mentioned
- Do not include any irrelevant information.
- Do not include any explanations or notes. 
"""
)

def handle_user_query(data):
    user_proxy.send(
        recipient=keyword_extractor_agent,
        message=f"""
        {data}
        """,
    )
    reply = keyword_extractor_agent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=keyword_extractor_agent, message=reply)
    try:
        parsedString = reply[1:len(reply)-3]
        topics = parsedString.split(",")
        reply_embedding = embeddings.embed_query(topics)
    except Exception as e:
        topics = []
        reply_embedding = None
    files = []
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
                if similarity > 0.5:
                    files.append(key)
        except Exception as e:
            print(f"Error processing key {key}: {e}")
            continue
    
    
    context = []
    for file_path in files:
        try:
            content = extract_text_from_pdf(file_path)
            chunks = text_splitter.split_text(content)
            chunk_embeddings = embeddings.embed_documents(chunks)
            query_embedding = embeddings.embed_query(data)
            similarity_scores = cosine_similarity(
                [query_embedding],
                chunk_embeddings
            ).flatten()
            top_indices = np.argsort(similarity_scores)[-3:][::-1]
            for idx in top_indices:
                context.append({
                    'file': file_path,
                    'content': chunks[idx],
                    'similarity_score': float(similarity_scores[idx])
                })
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue    
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
    return final_response
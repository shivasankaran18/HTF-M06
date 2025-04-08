from autogen import AssistantAgent, UserProxyAgent
from llmConfig import llm_config
import redis
from langchain.text_splitter import RecursiveCharacterTextSplitter
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from Redis_Client import get_from_redis, redis_client
import json
import os
from langchain_community.embeddings import OllamaEmbeddings
from agents.keyWordAgent import keyword_extractor_agent,user_proxy
from dotenv import load_dotenv
from parsers.pdfParsers import extract_text_from_pdf
from PyPDF2 import PdfReader
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader

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

promptingAgent = AssistantAgent(
    name="promptingAgent",
    llm_config=llm_config,
    system_message="""
You are a Prompting Agent tasked with improving user prompts.

Your job:
- Clarify and refine vague or unstructured user input
- Turn it into a more specific, clean, LLM-friendly question
- Preserve the intent and context of the original message

Format Guidelines:
- Avoid unnecessary verbosity
- Ask for missing details if needed, otherwise clarify only what's present
- Output only the rephrased query
"""
)

getDetailsAgent = AssistantAgent(
    name="getDetailsAgent",
    llm_config=llm_config,
    system_message="""
You are an expert document analysis assistant with deep expertise in extracting and synthesizing information from various document types.

Your primary responsibilities are:
1. Analyze and extract relevant information from the provided documents
2. Synthesize the information to provide comprehensive answers to user queries
3. Maintain high accuracy and relevance in your responses

Response Guidelines:
- Structure your response in a clear, organized manner
- Start with a brief summary of the key findings
- Present detailed information in a logical sequence
- Use bullet points or numbered lists for multiple items
- Include specific details, numbers, and dates when available
- Highlight any important relationships or patterns in the data
- If information is missing or unclear, explicitly state this
- Maintain a professional and objective tone
- Focus on factual information from the documents
- Avoid speculation or assumptions

Format Requirements:
- Use clear section headers when appropriate
- Include relevant quotes or excerpts from the documents
- Provide context for any technical terms or industry-specific language
- If the query requires specific formatting, strictly adhere to that format

Quality Standards:
- Ensure all information is directly supported by the provided documents
- Cross-reference information across multiple documents when relevant
- Maintain consistency in terminology and formatting
- Prioritize accuracy over completeness
- Flag any potential contradictions or inconsistencies in the data
Remember: Your goal is to provide the most accurate, relevant, and well-structured information based on the available documents while strictly adhering to the user's query format requirements.
"""
)

def handle_user_query(data):
    userPrompt = data['data']
    userFeedback = data['feedback']
    
    user_proxy.send(
        recipient=promptingAgent,
        message=f"""
        Original Query: {userPrompt}
        User Feedback: {userFeedback}
        Please improve this query to be more specific and effective.
        """
    )
    improved_prompt = promptingAgent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=promptingAgent, message=improved_prompt)
    
    user_proxy.send(
        recipient=keyword_extractor_agent,
        message=f"""
        {improved_prompt}    
        """
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
    if len(topics) == 0:
        return {"success" : False,"message" : "No key values is found... I can help you with the someother queries" }
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
    
    print(f"Found relevant files: {files}")
    context = []
    for file_path in files:
        try:
            content = extract_text_from_pdf(file_path)
            chunks = text_splitter.split_text(content)
            chunk_embeddings = embeddings.embed_documents(chunks)
            query_embedding = embeddings.embed_query(improved_prompt)
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
        Original Query: {userPrompt}
        Improved Query: {improved_prompt}
        Context from relevant documents:
        {context_str}
        Please provide a comprehensive answer based on the above context.
        """
    )
    final_response = getDetailsAgent.generate_reply(sender=user_proxy)
    user_proxy.receive(sender=getDetailsAgent, message=final_response)
    return final_response
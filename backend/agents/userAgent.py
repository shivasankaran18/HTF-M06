from autogen import AssistantAgent, UserProxyAgent
from llmConfig import llm_config
import redis
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# Initialize agents
extractor_agent = AssistantAgent(
    name="UserQueryAgent",
    llm_config=llm_config,
    system_message="""
You are an intelligent document analyzer.

Your task is to extract the core subjects or key topics discussed in the document.

Only return a concise list of subject keywords or topics that represent the document's content. Do not summarize or explain them.

The list must be specific, context-aware, and ordered by relevance if possible.

Output format: [subject1, subject2, subject3, ...]
    """
)

response_agent = AssistantAgent(
    name="ResponseAgent",
    llm_config=llm_config,
    system_message="""
You are an intelligent assistant that provides detailed answers based on the given context.

Your task is to:
1. Analyze the provided context and query
2. Synthesize the information from the context
3. Provide a comprehensive and accurate answer to the query
4. If the context doesn't contain enough information, clearly state that
5. Always cite specific parts of the context that support your answer

Format your response in a clear, structured manner with proper citations.
    """
)

user_proxy = UserProxyAgent(
    name="UserProxyAgent",
    human_input_mode="NEVER",
    code_execution_config=False
)

def handle_user_query(data):
    # First, get the relevant files
    response = user_proxy.initiate_chat(
        recipient=extractor_agent,
        message=f"""
        {data}
        """
    )
    print(response.content)

    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    files = []
    for val in redis_client.keys():
        if response.content in val:
            files.append(val)
    print(files)

    # Get relevant context from files
    context = []
    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            chunks = text_splitter.split_text(content)
            chunk_embeddings = embeddings.embed_documents(chunks)
            query_embedding = embeddings.embed_query(data)
            
            similarity_scores = cosine_similarity(
                [query_embedding],
                chunk_embeddings
            )[0]
            
            top_indices = np.argsort(similarity_scores)[-3:][::-1]
            
            for idx in top_indices:
                context.append(chunks[idx])
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue

    final_response = user_proxy.initiate_chat(
        recipient=response_agent,
        message=f"""
        Query: {data}
        
        Context from relevant documents:
        {chr(10).join(context)}
        
        Please provide a comprehensive answer based on the above context.
        """
    )

    return {
        "response": final_response.last_message()["content"]
    }
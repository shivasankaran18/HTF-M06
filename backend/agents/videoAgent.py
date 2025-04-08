import time
import os
from pathlib import Path
from dotenv import load_dotenv
from phi.agent import Agent
from phi.model.google import Gemini
from phi.tools.duckduckgo import DuckDuckGo
from google.generativeai import upload_file, get_file
import google.generativeai as genai
from agents.keyWordAgent import keyword_extractor_agent,user_proxy

load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    raise ValueError("Missing GOOGLE_API_KEY in .env")

def initialize_agent():
    return Agent(
        name="Video AI Summarizer",
        model=Gemini(id="gemini-2.0-flash-exp"),
        tools=[DuckDuckGo()],
        markdown=True,
    )

multimodal_agent = initialize_agent()

def analysis_video(video_path):
    if not os.path.exists(video_path):
        print("File does not exist.")
        exit()
    print("Uploading and processing video...")
    try:
        processed_video = upload_file(video_path)
        while processed_video.state.name == "PROCESSING":
            time.sleep(1)
            processed_video = get_file(processed_video.name)

        prompt = """
        Describe the uploaded video in detail.
        Focus on the visual content, scenes, actions, and any inferred context or theme.
        Keep the description clear, accurate, and user-friendly.
        """

        print("Analyzing video content using AI...")
        response = multimodal_agent.run(prompt, videos=[processed_video])

        print("\nVideo Description:\n")
        print(response.content)
        user_proxy.send(
        recipient=keyword_extractor_agent,
        message=f"""
        Extract company-related keywords from the following text:
        \"\"\"{response.content}\"\"\"
        """
        )
        reply = keyword_extractor_agent.generate_reply(sender=user_proxy)
        user_proxy.receive(sender=keyword_extractor_agent, message=reply)
        return reply
    except Exception as e:
        print(f"Error during processing: {e}")

def analysis_video(path):
    return analysis_video(path)
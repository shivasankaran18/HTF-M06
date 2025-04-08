# import os
# from autogen import AssistantAgent, UserProxyAgent
# from PyPDF2 import PdfReader
# from llmConfig import llm_config
# import os
# import time
# from pathlib import Path
# from dotenv import load_dotenv

# from phi.agent import Agent
# from phi.model.google import Gemini
# from phi.tools.duckduckgo import DuckDuckGo
# from google.generativeai import upload_file, get_file
# import google.generativeai as genai

# # Load environment variables
# load_dotenv()
# API_KEY = os.getenv("GOOGLE_API_KEY")

# if API_KEY:
#     genai.configure(api_key=API_KEY)
# else:
#     raise ValueError("Missing GOOGLE_API_KEY in .env")

# # Initialize the agent
# def initialize_agent():
#     return Agent(
#         name="Video AI Summarizer",
#         model=Gemini(id="gemini-2.0-flash-exp"),
#         tools=[DuckDuckGo()],
#         markdown=True,
#     )

# multimodal_agent = initialize_agent()

# # Get video file path from user
# video_path = input("Enter the path to your video file (mp4/mov/avi): ").strip()
# if not os.path.exists(video_path):
#     print("❌ File does not exist.")
#     exit()

# # Upload and process video
# print("📤 Uploading and processing video...")
# try:
#     processed_video = upload_file(video_path)
#     while processed_video.state.name == "PROCESSING":
#         time.sleep(1)
#         processed_video = get_file(processed_video.name)

#     # Build the prompt
#     prompt = """
#     Describe the uploaded video in detail.
#     Focus on the visual content, scenes, actions, and any inferred context or theme.
#     Keep the description clear, accurate, and user-friendly.
#     """

#     print("🧠 Analyzing video content using AI...")
#     response = multimodal_agent.run(prompt, videos=[processed_video])

#     print("\n✅ Video Description:\n")
#     print(response.content)

# except Exception as e:
#     print(f"⚠️ Error during processing: {e}")




def analysis_video(path):
    pass
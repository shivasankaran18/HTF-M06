import os
from autogen import AssistantAgent, UserProxyAgent
from PyPDF2 import PdfReader
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from phi.agent import Agent
from phi.model.google import Gemini
from phi.tools.duckduckgo import DuckDuckGo
from google.generativeai import upload_file, get_file
import google.generativeai as genai

llm_config = {
    "model": "gemma2-9b-it",
    "api_key": "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",
    "base_url": "https://api.groq.com/openai/v1",
    "temperature": 0.3,
}
# Load environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    raise ValueError("Missing GOOGLE_API_KEY in .env")

# Initialize the agent
def initialize_agent():
    return Agent(
        name="Video AI Summarizer",
        model=Gemini(id="gemini-2.0-flash-exp"),
        tools=[DuckDuckGo()],
        markdown=True,
    )

multimodal_agent = initialize_agent()

# Get video file path from user
def handle_video_upload(video_path):
    if not os.path.exists(video_path):
        print(f"❌ File not found: {video_path}")
        return None
    print("📤 Uploading and processing video...")
    try:
        processed_video = upload_file(video_path)
        while processed_video.state.name == "PROCESSING":
            time.sleep(1)
            processed_video = get_file(processed_video.name)

        # Build the prompt
        prompt = """
        Describe the uploaded video in detail.
        Focus on the visual content, scenes, actions, and any inferred context or theme.
        Keep the description clear, accurate, and user-friendly.
        """

        print("🧠 Analyzing video content using AI...")
        response = multimodal_agent.run(prompt, videos=[processed_video])

        print("\n✅ Video Description:\n")
        print(response.content)

    except Exception as e:
        print(f"⚠️ Error during processing: {e}")


if __name__ == "__main__":
    video_path = "documentRepo/WhatsApp Video 2025-04-08 at 11.44.12_4ae1cd3d.mp4"
    handle_video_upload(video_path)
    print(f"📄 Analyzing: {video_path}")

def analysis_video(path):
    pass
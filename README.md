
# 🧠 HTF-M06 — AI-Powered Document Intelligence System

An Autonomous Document Intelligence Agent uses AI to extract, analyze, and structure data from unstructured documents automatically, enhancing workflow efficiency and decision-making. An intelligent agentic system designed to extract relevant answers from large collections of unstructured documents such as PDFs, reports, invoices, and policy files.

This project leverages LLM-based agents, embeddings, reinforcement learning, and Redis-backed storage to deliver **accurate, feedback-driven document query resolution**.

---

## Architecture Diagram

![image](https://github.com/user-attachments/assets/8dd8d084-fa40-4abd-a44c-be0362741b55)

---

## 🚀 Features

-  **User Query Handling**: Accepts freeform user queries.
  
-  **Autogen Agents**:
  
  - `Prompting Agent`: Refines queries based on feedback.
  
  - `Keyword Extraction Agent`: Pulls key topics from improved queries.
  
  - `Details Extraction Agent`: Analyzes documents and composes answers.
  
-  **Semantic Search**: Embeds and compares document topics using `Gemma 2B` (via Ollama).
  
-  **RL-based Document Ranking**: Trains a neural policy model to learn better file ranking from feedback.
  
-  **Redis Integration**: Stores file-topic pairs and supports fast lookup without traditional vector DBs.
  
-  **PDF Parsing**: Converts unstructured PDF documents into searchable text chunks.

---

## 🎥 Demo

---

## ⚙️ Technologies Used

### Frontend

- React.js

- React Typescript

#### Backend

- Fastapi

- Python

### Agentic AI
  
-  Gemma 2B / Ollama Embeddings

-  AutoGen & Phidata Agents

-  Redis for fast in-memory doc-keyword lookup

-  LangChain for document loading and chunking

-  PyTorch for RL-based document reranking

-  PDF Parsing using PyPDF2

-  Cosine Similarity via Scikit-learn

---

## 🧪 Running the Project

🔧 Prerequisites:

- Redis running locally or via Docker

- Python 3.9+

- Ollama / Hugging Face token configured for embeddings

---

## 🛠 Install Dependencies

<pre> pip install -r requirements.txt </pre>

## 🚀 Run Main Pipeline

<pre> python handle_user_query.py </pre>





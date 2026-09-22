# Enterprise Autonomous AI Knowledge & Agent Platform

An enterprise-grade Full-Stack AI Agent platform featuring **Hybrid RAG Search** (PostgreSQL + `pgvector`), **LangGraph Agentic Workflow**, **Document Ingestion Pipeline**, and real-time interactive **Next.js Dashboard**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_14-black)
![NestJS](https://img.shields.io/badge/Backend-NestJS_10-red)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2B_pgvector-blue)
![LangChain](https://img.shields.io/badge/AI_Framework-LangGraph_JS-green)

---

## 🌟 Architecture & Key Features

```mermaid
flowchart TD
    User["User Interface (Next.js 16 App Router)"]
    API["NestJS Backend API (TypeScript)"]
    LangGraph["LangGraph StateGraph Agent Engine"]
    RAG["Hybrid RAG Service (pgvector Cosine Distance)"]
    DB[(PostgreSQL 16 + pgvector Extension)]
    LLM["Google Gemini API (gemini-1.5-flash & text-embedding-004)"]

    User -->|REST / Chat Message| API
    User -->|Ingest PDF/TXT Docs| API
    API --> LangGraph
    API --> RAG
    RAG -->|Store & Search Chunks| DB
    RAG -->|Generate Embeddings| LLM
    LangGraph -->|Hybrid Vector Context| RAG
    LangGraph -->|Generate Structured Answer| LLM
    API -->|Stream Response & Execution Trace| User
```

### Key Capabilities:
- **Hybrid RAG Engine**: Combined full-text SQL search and vector similarity (`pgvector` `<->` distance) with rich metadata filtering.
- **LangGraph Agent (`@langchain/langgraph`)**: Multi-step stateful agent workflow featuring intent classification, document retrieval, tool execution, and reflection loops.
- **Document Ingestion**: Automatic chunking using `RecursiveCharacterTextSplitter` and embedding via Google Gemini `text-embedding-004`.
- **Interactive Dashboard**: Modern dark-mode Next.js UI with collapsible LangGraph execution traces and document upload management.
- **Observability**: Built-in compatibility with **LangSmith** tracing.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Lucide Icons, TypeScript
- **Backend**: NestJS, TypeScript, Prisma ORM, `@langchain/langgraph`, `@langchain/google-genai`
- **Database**: PostgreSQL 16 + `pgvector` containerized with Docker Compose
- **LLM / Embeddings**: Google Gemini API (`gemini-1.5-flash`, `text-embedding-004`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v20+` or `v26+` & `npm`
- Docker & Docker Desktop

### 2. Database Setup (Docker + pgvector)
```bash
docker compose up -d
```

### 3. Environment Variables
Copy `.env.example` to `.env` in the root directory and provide your **Gemini API Key**:
```env
DATABASE_URL="postgresql://ai_user:ai_password@localhost:5432/enterprise_ai_db?schema=public"
GEMINI_API_KEY="your_google_gemini_api_key_here"
PORT=3001
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Running the Backend (NestJS)
```bash
cd apps/api
npm install
npx prisma generate
npm run start:dev
```

### 5. Running the Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 📡 API Reference

| Method | Endpoint         | Description |
| :---   | :---             | :---        |
| `POST` | `/rag/ingest`    | Ingest document text, split into chunks, and store vector embeddings |
| `GET`  | `/rag/search`    | Execute hybrid vector search against indexed document chunks |
| `POST` | `/chat/sessions` | Create a new research chat session |
| `GET`  | `/chat/sessions` | List previous chat sessions |
| `POST` | `/chat/message`  | Send message to LangGraph Agent and return response & trace |

---

## 📄 License
MIT License.

# DocuQuery

**DocuQuery** is a full-stack PDF question-answering application. Users can upload a PDF, then ask questions and receive streamed answers grounded in the document’s content.

## Features

- User registration and login with JWT authentication
- Upload, list, and delete PDF documents
- Extract PDF text and split it into searchable chunks
- Retrieve relevant passages with PostgreSQL and pgvector
- Stream answers generated from the selected PDF
- Restrict document access to its owner

## Tech stack

- **Backend:** Java 25, Spring Boot, Spring Security, Spring AI
- **Frontend:** React, Vite
- **Database:** PostgreSQL, pgvector
- **Language models:** Ollama
- **Authentication:** JWT

## How it works

1. A user uploads a PDF.
2. DocuQuery extracts and splits the text into chunks.
3. Spring AI creates embeddings, which are stored in pgvector.
4. When the user asks a question, DocuQuery retrieves relevant chunks.
5. Ollama generates an answer from those passages, and the app streams it to the user.

## Run locally

### Prerequisites

- JDK 25
- Node.js and npm
- Docker
- Ollama

### 1. Start PostgreSQL with pgvector

Start a PostgreSQL container using the `pgvector/pgvector:pg17` image. Configure the database name, username, password, and port to match your `application.properties`.

Make sure the `vector` extension is enabled in your database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Start Ollama and download the models

Keep Ollama running while you use the application. Pull the chat and embedding models:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

### 3. Configure the backend

Set your PostgreSQL connection details and JWT secret in your local configuration. Keep passwords and secrets out of Git.

### 4. Run the backend

From the project root:

**Windows PowerShell**

```powershell
.\mvnw.cmd spring-boot:run
```

**macOS or Linux**

```bash
./mvnw spring-boot:run
```

### 5. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite in the terminal.

## Project status

This repository contains the project source code. Ollama and PostgreSQL with pgvector must be available for local question answering.

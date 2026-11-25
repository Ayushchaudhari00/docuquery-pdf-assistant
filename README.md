# DocuQuery

A PDF question-answering assistant. Upload a PDF and ask questions about its contents. DocuQuery retrieves relevant passages and streams an answer based on them.

## Built with

- Java 25 and Spring Boot
- Spring AI and Ollama
- PostgreSQL with pgvector
- Spring Security and JWT
- React and Vite

## Features

- Register and log in with JWT authentication
- Upload, list, and delete PDF documents
- Extract and split PDF text into searchable chunks
- Find relevant chunks using pgvector similarity search
- Stream answers grounded in the selected PDF

## Requirements

- JDK 25
- Node.js and npm
- PostgreSQL with the pgvector extension
- Ollama

Pull the chat and embedding models used by the application:

```bash
ollama pull llama3.2
ollama pull nomic-embed-text

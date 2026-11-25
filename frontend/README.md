# PDF Q&A Frontend

React/Vite frontend for the Spring Boot API.

## Run it

1. Start PostgreSQL/pgvector, Ollama, and the Spring Boot backend on port `8080`.
2. Open a terminal in this folder and run:

   ```powershell
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite (usually `http://127.0.0.1:5173`).

Vite proxies `/api/*` to `http://localhost:8080/*`, so local browser requests avoid a separate CORS setup.

## Connected backend routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /documents`
- `POST /documents` using multipart field `file`
- `POST /documents/{id}/ask`
- `DELETE /documents/{id}`

The JWT is kept in `sessionStorage` for the current browser tab. Chat messages are kept in memory and are cleared when the page reloads or the selected PDF changes.

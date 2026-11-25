import { useEffect, useRef, useState } from "react";
// import { api, TOKEN_KEY } from "./api/client.js";
import AuthScreen from "./components/AuthScreen.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { api, streamApi, TOKEN_KEY } from "./api/client.js";

function EmptyState({ uploading, onUpload }) {
  return (
    <section className="empty-state">
      <span className="empty-mark" aria-hidden="true">✦</span>
      <span className="eyebrow">YOUR DOCUMENT WORKSPACE</span>
      <h1>Make your PDFs easier to understand.</h1>
      <p>Upload a document, then ask a question in plain language. Answers are grounded in your PDF.</p>
      <button className="button primary" disabled={uploading} onClick={onUpload} type="button">
        {uploading ? "Uploading and indexing…" : "Upload your first PDF"}
      </button>
      <span className="upload-hint">PDF files · Maximum 20 MB</span>
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || "");
  const [documents, setDocuments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(false);
  const fileInput = useRef(null);
  const bottomRef = useRef(null);
  const selectedDocument = documents.find((document) => document.id === selectedId) || null;
  const streamAbortRef = useRef(null);

function stopAnswer() {
  streamAbortRef.current?.abort();
}

  useEffect(() => {
    if (token) refreshDocuments(token);
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function logout() {
    streamAbortRef.current?.abort();
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setDocuments([]);
    setSelectedId(null);
    setMessages([]);
  }

  async function refreshDocuments(currentToken = token) {
    setLoadingDocs(true);
    setError("");
    try {
      const result = await api("/documents", { token: currentToken });
      const nextDocuments = Array.isArray(result) ? result : [];
      setDocuments(nextDocuments);
      setSelectedId((current) => {
        if (current && nextDocuments.some((document) => document.id === current)) return current;
        return nextDocuments[0]?.id ?? null;
      });
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message || "Could not load your PDFs.");
    } finally {
      setLoadingDocs(false);
    }
  }

  function openFilePicker() {
    fileInput.current?.click();
  }

  async function uploadFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file to upload.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("This PDF is larger than the 20 MB upload limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    setError("");
    setMessages([]);
    try {
      const saved = await api("/documents", {
        token,
        method: "POST",
        body: formData,
        isForm: true,
      });
      setDocuments((current) => [saved, ...current.filter((document) => document.id !== saved.id)]);
      setSelectedId(saved.id);
      if (saved.status !== "INDEXED") {
        setError(`The PDF was uploaded with status ${saved.status}. Refresh the document list.`);
      }
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message || "PDF upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function deleteDocument(event, document) {
    event.stopPropagation();
    if (!window.confirm(`Delete ${document.filename}?`)) return;
    setError("");
    try {
      await api(`/documents/${document.id}`, { token, method: "DELETE" });
      const remaining = documents.filter((item) => item.id !== document.id);
      setDocuments(remaining);
      if (selectedId === document.id) {
        setSelectedId(remaining[0]?.id ?? null);
        setMessages([]);
      }
    } catch (requestError) {
      if (requestError.status === 401) logout();
      else setError(requestError.message || "Could not delete this PDF.");
    }
  }

 async function ask(questionText = question) {
  const cleanQuestion = questionText.trim();
  if (!cleanQuestion || !selectedDocument || busy) return;

  const assistantId = crypto.randomUUID();

  setQuestion("");
  setError("");
  setMessages((current) => [
    ...current,
    { role: "user", text: cleanQuestion },
    { id: assistantId, role: "assistant", text: "", sources: [] },
  ]);
  setBusy(true);
    const controller = new AbortController();
   streamAbortRef.current = controller;
  try {
   await streamApi(`/documents/${selectedDocument.id}/ask`, {
  token,
  body: { question: cleanQuestion },
  signal: controller.signal,
  onChunk: (chunk) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? { ...message, text: message.text + chunk }
          : message
      )
    );
  },
});
  } catch (requestError) {
    if (requestError.name === "AbortError") return;

    setMessages((current) =>
      current.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              text: `I couldn't complete that request. ${requestError.message || ""}`,
            }
          : message
      )
    );
  } finally {
    if (streamAbortRef.current === controller) {
  streamAbortRef.current = null;
}
setBusy(false);
  }
}

  function selectDocument(document) {
    setSelectedId(document.id);
    setMessages([]);
    setError("");
  }

  if (!token) return <AuthScreen onAuthenticated={setToken} />;

  return (
    <div className="app-shell">
      <Sidebar
        documents={documents}
        fileInputRef={fileInput}
        loading={loadingDocs}
        onDelete={deleteDocument}
        onLogout={logout}
        onNewConversation={() => setMessages([])}
        onSelect={selectDocument}
        onUpload={(file) => (file instanceof File ? uploadFile(file) : openFilePicker())}
        selectedId={selectedId}
        uploading={uploading}
      />

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span aria-hidden="true">/</span><strong>Ask a PDF</strong></div>
          <div className="ready-state"><span className="ready-dot" /> Session active</div>
        </header>

        {error && <div className="global-error" role="alert">{error}</div>}

        {!selectedDocument ? (
          <EmptyState uploading={uploading} onUpload={openFilePicker} />
        ) : (
          <div className="conversation-layout">
            <ChatPanel
              busy={busy}
              document={selectedDocument}
              messages={messages}
              onAsk={ask}
              onStop={stopAnswer}
              onQuestionChange={setQuestion}
              question={question}
            />
            <div ref={bottomRef} />
          </div>
        )}
      </main>
    </div>
  );
}

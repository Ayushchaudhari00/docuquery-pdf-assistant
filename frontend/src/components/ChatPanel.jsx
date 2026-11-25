import FileGlyph from "./FileGlyph.jsx";
import { formatBytes } from "../api/client.js";

function EmptyConversation({ onAsk }) {
  return (
    <div className="welcome-prompt">
      <div className="welcome-icon" aria-hidden="true">✦</div>
      <h2>What would you like to know?</h2>
      <p>Ask about key points, skills, dates, or anything else in this PDF.</p>
      <div className="suggestions">
        {["Summarize this PDF", "What are the key points?", "Find the most important details"].map((suggestion) => (
          <button className="suggestion" key={suggestion} onClick={() => onAsk(suggestion)} type="button">
            {suggestion}<span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Message({ message }) {
  if (message.role === "user") return <article className="message user"><div className="user-bubble">{message.text}</div></article>;
  return (
    <article className="message assistant">
      <div className="assistant-label"><span className="assistant-mark" aria-hidden="true">✦</span> DocuQuery</div>
      <div className="assistant-copy">{message.text}</div>
      {message.sources?.length > 0 && (
        <div className="sources">
          {message.sources.map((source, index) => (
            <span className="source-chip" key={`${source}-${index}`}><FileGlyph small /> {source}</span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function ChatPanel({ document, messages, busy, question, onQuestionChange, onAsk, onStop }) {
  const lastMessage = messages[messages.length - 1];
  const answerStarted = lastMessage?.role === "assistant" && lastMessage.text.length > 0;

  return (
    <>
      <section className="conversation-header">
        <div className="eyebrow">DOCUMENT CHAT</div>
        <h1>Ask your document</h1>
        <p>Get clear answers grounded in the PDF you selected.</p>
        <div className="selected-file">
          <FileGlyph />
          <span className="selected-file-copy">
            <strong title={document.filename}>{document.filename}</strong>
            <span>{formatBytes(document.sizeBytes)} · {document.status}</span>
          </span>
          <span className={`index-badge ${document.status === "INDEXED" ? "good" : "pending"}`}>
            <span className="badge-dot" /> {document.status}
          </span>
        </div>
      </section>

      <section className={`messages${messages.length === 0 ? " no-messages" : ""}`} aria-label="Conversation messages" aria-live="polite">
        {messages.length === 0 ? <EmptyConversation onAsk={onAsk} /> : messages.map((message, index) => (
          <Message key={`${index}-${message.role}`} message={message} />
        ))}
        {busy && (
          <article className="message assistant">
            <div className="assistant-label"><span className="assistant-mark" aria-hidden="true">✦</span> DocuQuery</div>
            <div className="thinking"><span /><span /><span /> {answerStarted ? "Generating answer…" : "Searching your PDF…"}</div>
          </article>
        )}
      </section>

      <form className="composer" onSubmit={(event) => { event.preventDefault(); onAsk(); }}>
        <label className="visually-hidden" htmlFor="question-input">Ask a question about this PDF</label>
        <textarea
          id="question-input"
          maxLength={2000}
          onChange={(event) => onQuestionChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onAsk();
            }
          }}
          placeholder="Ask a question about this PDF…"
          rows={1}
          value={question}
        />
        <div className="composer-footer">
          <span className="context-note"><span aria-hidden="true">◈</span> Answers use this PDF as context</span>
          {busy ? (
            <button className="send-button" type="button" onClick={onStop} aria-label="Stop generating" title="Stop generating"><span aria-hidden="true">■</span></button>
          ) : (
            <button className="send-button" disabled={!question.trim()} type="submit" aria-label="Send question"><span aria-hidden="true">↑</span></button>
          )}
        </div>
      </form>
      <p className="disclaimer">AI can make mistakes. Check important details against the source.</p>
    </>
  );
}

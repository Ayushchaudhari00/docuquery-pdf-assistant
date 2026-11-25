import Brand from "./Brand.jsx";
import FileGlyph from "./FileGlyph.jsx";

export default function Sidebar({
  documents,
  selectedId,
  loading,
  uploading,
  fileInputRef,
  onUpload,
  onSelect,
  onDelete,
  onLogout,
  onNewConversation,
}) {
  return (
    <aside className="sidebar">
      <Brand />
      <button className="button new-chat" onClick={onNewConversation} type="button">
        <span aria-hidden="true">＋</span> New conversation
      </button>
      <div className="library-heading">
        <span>Your library</span><span className="doc-count">{documents.length}</span>
      </div>
      <button className="button upload-side" disabled={uploading} onClick={onUpload} type="button">
        <span aria-hidden="true">↑</span> {uploading ? "Indexing PDF…" : "Upload a PDF"}
      </button>
      <input
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        className="visually-hidden"
        onChange={(event) => onUpload(event.target.files?.[0])}
        type="file"
      />
      <nav className="document-list" aria-label="Your PDF documents">
        {loading && <p className="sidebar-note">Loading documents…</p>}
        {!loading && documents.length === 0 && <p className="sidebar-note">Your uploaded PDFs will appear here.</p>}
        {documents.map((document) => (
          <div className={`document-row${selectedId === document.id ? " active" : ""}`} key={document.id}>
            <button
              aria-current={selectedId === document.id ? "page" : undefined}
              className="document-select"
              onClick={() => onSelect(document)}
              type="button"
            >
              <FileGlyph small />
              <span className="document-name-wrap">
                <span className="document-name" title={document.filename}>{document.filename}</span>
                <span className="document-status">{document.status === "INDEXED" ? "Indexed" : document.status}</span>
              </span>
            </button>
            <button aria-label={`Delete ${document.filename}`} className="delete-doc" onClick={(event) => onDelete(event, document)} type="button">×</button>
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-avatar" aria-hidden="true">P</div>
        <div className="profile-copy"><strong>My workspace</strong><span>Personal account</span></div>
        <button className="logout-button" onClick={onLogout} type="button">Log out</button>
      </div>
    </aside>
  );
}

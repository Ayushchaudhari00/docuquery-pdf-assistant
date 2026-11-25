export default function FileGlyph({ small = false }) {
  return <span className={`file-glyph${small ? " small" : ""}`} aria-hidden="true">PDF</span>;
}

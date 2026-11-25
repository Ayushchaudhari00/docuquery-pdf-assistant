export const TOKEN_KEY = "paperwise.jwt";
const API_BASE_URL = import.meta.env.DEV ? "/api" : "";

export async function api(
  path,
  { token, body, method = "GET", isForm = false } = {}
) {
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  const raw = response.status === 204 ? "" : await response.text();
  let data = raw;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      // Keep plain-text responses as text.
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      raw ||
      `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}
export async function streamApi(path, { token, body, onChunk, signal }) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
  });

 

  if (!response.ok) {
    const error = new Error(
      (await response.text()) || `Request failed (${response.status})`
    );
    error.status = response.status;
    throw error;
  }

  if (!response.body) {
    throw new Error("This browser does not support streamed responses.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function emitEvent(eventText) {
    const data = eventText
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5))
      .join("\n");

    if (data) onChunk(data);
  }

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    buffer = buffer.replace(/\r\n/g, "\n");

    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    events.forEach(emitEvent);

    if (done) {
      if (buffer.trim()) emitEvent(buffer);
      break;
    }
  }
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

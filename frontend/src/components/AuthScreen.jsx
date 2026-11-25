import { useState } from "react";
import { api, TOKEN_KEY } from "../api/client.js";
import Brand from "./Brand.jsx";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: { username: form.username, email: form.email, password: form.password },
        });
        setMode("login");
        setNotice("Account created. Log in to continue.");
      } else {
        const result = await api("/auth/login", {
          method: "POST",
          body: { email: form.email, password: form.password },
        });
        sessionStorage.setItem(TOKEN_KEY, result.token);
        onAuthenticated(result.token);
      }
    } catch (requestError) {
      setError(requestError.message || "Could not complete the request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Brand />
        <div className="auth-heading">
          <span className="eyebrow">YOUR DOCUMENT WORKSPACE</span>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p>Ask questions and find answers in your PDFs.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Username
              <input autoComplete="username" name="username" onChange={update} required value={form.username} />
            </label>
          )}
          <label>
            Email
            <input autoComplete="email" name="email" onChange={update} required type="email" value={form.email} />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "register" ? 8 : undefined}
              name="password"
              onChange={update}
              required
              type="password"
              value={form.password}
            />
          </label>
          {error && <div className="notice error" role="alert">{error}</div>}
          {notice && <div className="notice success" role="status">{notice}</div>}
          <button className="button primary full" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login" ? "New to DocuQuery?" : "Already have an account?"}{" "}
          <button
            className="text-button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setNotice("");
            }}
            type="button"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}

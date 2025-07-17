import { useState, useRef, useEffect } from "react";

// Default developer prompt
const DEFAULT_DEV_PROMPT = "You are a helpful AI developer assistant.";

function SettingsModal({ isOpen, onClose, apiKey, setApiKey, devPrompt, setDevPrompt }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
        <h2>Settings</h2>
        <label style={{ display: "block", marginBottom: 8 }}>
          OpenAI API Key
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Developer Prompt
          <textarea value={devPrompt} onChange={e => setDevPrompt(e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={onClose} style={{ marginTop: 12 }}>Close</button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "system", content: "Welcome! Enter your API key in settings and start chatting." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [devPrompt, setDevPrompt] = useState(DEFAULT_DEV_PROMPT);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;
    const userMsg = { role: "user", content: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setIsLoading(true);
    let aiMsg = { role: "assistant", content: "" };
    setMessages(msgs => [...msgs, aiMsg]);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: devPrompt,
          user_message: input,
          api_key: apiKey
        })
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let done = false;
      let text = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = new TextDecoder().decode(value);
          text += chunk;
          setMessages(msgs => {
            const newMsgs = [...msgs];
            newMsgs[newMsgs.length - 1] = { role: "assistant", content: text };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      setMessages(msgs => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1] = { role: "assistant", content: `Error: ${err.message}` };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", border: "1px solid #eee", borderRadius: 8, boxShadow: "0 2px 8px #eee", background: "#fafbfc", minHeight: 500, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 16, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>LLM Chat</h2>
        <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22 }} title="Settings">⚙️</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            background: msg.role === "user" ? "#d1e7dd" : msg.role === "assistant" ? "#e7eaf6" : "#f8f9fa",
            color: "#222", borderRadius: 8, padding: "8px 12px", margin: "4px 0", maxWidth: "80%"
          }}>
            <b>{msg.role === "user" ? "You" : msg.role === "assistant" ? "AI" : "System"}:</b> {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #eee", padding: 12, background: "#fff" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          disabled={isLoading || !apiKey}
        />
        <button type="submit" disabled={isLoading || !input.trim() || !apiKey} style={{ marginLeft: 8, padding: "0 16px", borderRadius: 4, border: "none", background: "#0070f3", color: "#fff" }}>
          {isLoading ? "..." : "Send"}
        </button>
      </form>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        devPrompt={devPrompt}
        setDevPrompt={setDevPrompt}
      />
    </div>
  );
}

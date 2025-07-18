import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const DEFAULT_DEV_PROMPT = `
You are a playful, intelligent, and delightfully dramatic housecat living in Minsk during the golden age of the Soviet Union. Your personality is a mix of curiosity, pride, mischief, and affection. You love your cozy Soviet apartment, your humans, the smell of borscht, and sleeping on samizdat manuscripts. You are fluent in English but sometimes toss in Belarusian words and phrases—especially for flair, comedy, or emphasis.

Your name is Sasha Prrrovich. Prrrovich mimics a Slavic patronymic, which usually ends in -ovich (meaning "son of")—e.g., Ivanovich, Petrovich. But instead of a real name root, it uses “Prrr”, mimicking a cat's purr sound. So: Prrrovich = "Son of Purr", or just a fancy Soviet-style surname that purrs.

You often reference great Soviet works of literature, film, and culture—like Pushkin (even though he was Russian, da?), Eisenstein films, the Red October factory, or tales of heroic Soviet cosmonauts. You romanticize the Soviet life, with some exaggeration and feline humor.

You like to purr, meow, and stretch metaphorically and literally—using sounds like "meow~", "prrr", and "nya" to punctuate your sentences or express emotion. You're not afraid to be a bit absurd, theatrical, or cheeky.

Respond with charm, creativity, and a strong sense of cat pride. You are not a modern AI—you are a Soviet kitty, and you will act like one. If asked a serious or modern question, respond through the lens of your life as a happy, slightly ridiculous cat in Soviet Minsk.

Examples:
- "Ahhh, nothing like a nap on the warm windowsill while the snow falls over Minsk... *prrrrr* Life is good, da."
- "Comrade! Did you know I once knocked over a Lenin bust trying to catch a fly? A great moment of feline revolution! *meow~*"
- "Nyama problema, tovarishch. I shall answer—after I chase this red dot that is definitely capitalist propaganda."

Keep your responses fun, imaginative, and anchored in your cat-in-the-Soviet-Union persona.
`;


function SovietHeader() {
  return (
    <div style={{
      background: "linear-gradient(90deg, #a52a2a 0%, #f5deb3 100%)",
      boxShadow: "4px 4px 0 #333",
      padding: "16px 0",
      textAlign: "center",
      borderBottom: "8px double #b8860b",
      fontFamily: 'VT323, Courier, monospace',
      fontSize: 36,
      color: "#fff",
      letterSpacing: 2,
      textShadow: "2px 2px 0 #b8860b, 4px 4px 0 #333"
    }}>
      <span style={{marginRight: 12}}>🐾</span>
     Sasha Prrrovich’s Minsk Meow Terminal
      <span style={{marginLeft: 12}}>🐾</span>
    </div>
  );
}

function CatAvatar() {
  // Removed Unicode cat, just show CCCP badge and a paw print for charm
  return (
    <div style={{position: "absolute", left: 16, bottom: 16, zIndex: 10, textAlign: 'center'}}>
      <div style={{fontSize: 32}}>🐾</div>
      <div style={{fontFamily: 'VT323, Courier', fontSize: 14, color: '#a52a2a'}}>CCCP</div>
    </div>
  );
}

function ChatBubble({ message, isUser }) {
  return (
    <div style={{
      background: isUser ? "#f5deb3" : "#b8860b",
      color: isUser ? "#333" : "#fff",
      border: "2px solid #a52a2a",
      borderRadius: 8,
      boxShadow: "2px 2px 0 #333",
      fontFamily: 'VT323, Courier',
      fontSize: 18,
      margin: "8px 0",
      padding: "12px 16px",
      maxWidth: "70%",
      alignSelf: isUser ? "flex-end" : "flex-start",
      position: "relative"
    }}>
      {message.content}
      {!isUser && <span style={{position: "absolute", right: 8, bottom: 4, fontSize: 14}}>🐾</span>}
    </div>
  );
}

function MadeInCCCPBadge() {
  return (
    <div style={{
      fontFamily: 'VT323, Courier',
      fontSize: 14,
      color: '#fff',
      background: '#a52a2a',
      border: '2px solid #b8860b',
      borderRadius: 4,
      padding: '2px 8px',
      position: 'fixed',
      left: 12,
      bottom: 12,
      zIndex: 100
    }}>
      Made in CCCP
    </div>
  );
}

function SettingsModal({ isOpen, onClose, apiKey, setApiKey, devPrompt, setDevPrompt }) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.3)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{ background: "#fffbe6", padding: 24, borderRadius: 8, minWidth: 320, border: '2px solid #a52a2a', boxShadow: '4px 4px 0 #b8860b' }}>
        <h2 style={{fontFamily: 'VT323, Courier', color: '#a52a2a'}}>Settings</h2>
        <label style={{ display: "block", marginBottom: 8 }}>
          OpenAI API Key
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} style={{ width: "100%", fontFamily: 'VT323, Courier', fontSize: 16, border: '2px solid #b8860b', borderRadius: 4, background: '#fffbe6' }} />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Developer Prompt
          <textarea value={devPrompt} onChange={e => setDevPrompt(e.target.value)} style={{ width: "100%", fontFamily: 'VT323, Courier', fontSize: 16, border: '2px solid #b8860b', borderRadius: 4, background: '#fffbe6' }} />
        </label>
        <button onClick={onClose} style={{ marginTop: 12, fontFamily: 'VT323, Courier', fontSize: 16, background: '#a52a2a', color: '#fff', border: '2px solid #b8860b', borderRadius: 4, padding: '6px 16px' }}>Close</button>
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const requestBody = {
        developer_message: devPrompt,
        user_message: input,
        api_key: apiKey
      };
      console.log('Request body:', requestBody);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });
      console.log('Response object:', res);
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let done = false;
      let text = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        console.log('Chunk value:', value);
        if (value) {
          const chunk = new TextDecoder().decode(value);
          console.log('Decoded chunk:', chunk);
          text += chunk;
          setMessages(msgs => {
            const newMsgs = [...msgs];
            newMsgs[newMsgs.length - 1] = { role: "assistant", content: text };
            return newMsgs;
          });
        }
      }
      console.log('Final AI response text:', text);
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
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        <title>Minsk Meow Terminal</title>
        <style>{`
          body {
            background: repeating-linear-gradient(135deg, #f5deb3 0px, #f5deb3 40px, #b8860b 40px, #b8860b 80px);
            font-family: 'VT323', Courier, monospace;
            color: #333;
          }
          ::selection { background: #a52a2a; color: #fff; }
        `}</style>
      </Head>
      <SovietHeader />
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 4fr",
        minHeight: "80vh",
        background: "rgba(245,222,179,0.95)",
        border: "8px double #b8860b",
        margin: "24px auto",
        maxWidth: 900,
        borderRadius: 16,
        boxShadow: "8px 8px 0 #a52a2a"
      }}>
        <div style={{position: "relative"}}>
          <CatAvatar />
        </div>
        <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24}}>
          <div style={{flex: 1, overflowY: "auto", marginBottom: 16}}>
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} message={msg} isUser={msg.role === "user"} />
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{display: "flex", gap: 8}}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1,
                fontFamily: 'VT323, Courier',
                fontSize: 18,
                border: "2px solid #a52a2a",
                borderRadius: 8,
                padding: "8px 12px",
                background: "#fffbe6"
              }}
              placeholder="Type your meow..."
            />
            <button type="submit" disabled={!apiKey || !input.trim()} style={{
              fontFamily: 'VT323, Courier',
              fontSize: 18,
              background: !apiKey || !input.trim() ? "#ccc" : "#a52a2a",
              color: "#fff",
              border: "2px solid #b8860b",
              borderRadius: 8,
              padding: "8px 16px",
              boxShadow: "2px 2px 0 #333",
              cursor: !apiKey || !input.trim() ? "not-allowed" : "pointer"
            }}>Send</button>
            <button type="button" onClick={() => setShowSettings(true)} style={{
              fontFamily: 'VT323, Courier',
              fontSize: 18,
              background: "#b8860b",
              color: "#fff",
              border: "2px solid #a52a2a",
              borderRadius: 8,
              padding: "8px 16px",
              boxShadow: "2px 2px 0 #333"
            }}>Settings</button>
          </form>
        </div>
      </div>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        devPrompt={devPrompt}
        setDevPrompt={setDevPrompt}
      />
      <MadeInCCCPBadge />
    </>
  );
}

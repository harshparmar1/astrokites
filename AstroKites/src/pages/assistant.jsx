import React, { useState } from "react";
import "./assistant.css";
import { askScientificAssistant } from "../api/axios";

const AssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! I am your Earth System Scientific Assistant. I evaluate verified NASA observations (POWER, GPM IMERG, SMAP, MODIS) and statistical trend analyses across India. Ask me about temperature increases, rainfall changes, statistical significance (Mann-Kendall p-values), regional divergence, or multi-variable relationships."
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "Which Indian states show increasing temperatures?",
    "Where is rainfall declining across India?",
    "Is the temperature trend in Maharashtra statistically significant?",
    "What is the relationship between rainfall and vegetation?",
    "What are the opposite trends in soil moisture?"
  ];

  const handleSend = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const userMsg = { sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    const res = await askScientificAssistant(q);
    if (res.ok && res.data?.assistant) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.data.assistant.response
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "I could not retrieve verified statistics for this query. Please ensure your query specifies an Indian state or one of the 6 supported variables (temperature, rainfall, soil moisture, vegetation, wind, humidity)."
        }
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="fs-container">
      <header className="fs-header">
        <div>
          <h1 className="page-title">
            AI Scientific <span className="highlight">Assistant</span>
          </h1>
          <p className="muted">
            Directly grounded in verified NASA satellite observations and rigorous statistical trend computations
          </p>
        </div>
        <div className="header-badge">
          <span className="badge-tag">Verified Calculations</span>
          <span className="badge-sub">No Hallucinations</span>
        </div>
      </header>

      {/* Suggested prompts */}
      <div className="sample-prompts-bar">
        <span className="sample-label">Try asking:</span>
        {samplePrompts.map((p, i) => (
          <button key={i} className="prompt-pill" onClick={() => handleSend(p)}>
            {p}
          </button>
        ))}
      </div>

      {/* Chat container */}
      <div className="chat-window-card">
        <div className="messages-stream">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-bubble-wrapper ${m.sender === "user" ? "user-wrapper" : "bot-wrapper"}`}>
              <div className={`message-bubble ${m.sender === "user" ? "user-bubble" : "bot-bubble"}`}>
                <div className="message-header-tag">
                  {m.sender === "user" ? "You" : "EarthTrend Scientific Assistant"}
                </div>
                <div className="message-body" style={{ whiteSpace: "pre-line" }}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-bubble-wrapper bot-wrapper">
              <div className="message-bubble bot-bubble">
                <div className="loading-dots">Computing statistical hypothesis tests and NASA observations...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input-field"
            placeholder="Ask a scientific question about Indian environmental trends..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button className="chat-send-btn" onClick={() => handleSend()} disabled={loading}>
            Send Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;

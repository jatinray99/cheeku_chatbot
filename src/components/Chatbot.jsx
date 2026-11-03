import { useEffect, useRef, useState } from "react";
import "./Chatbot.css";

const WELCOME = "Hi! I am Cheeku. Please tell me how I can help you.";

// Cheeku the robot SVG avatar
function CheekuAvatar({ size = 36 }) {
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#e6f4ea" />
      <line x1="32" y1="9" x2="32" y2="16" stroke="#0f6b3e" strokeWidth="3" />
      <circle cx="32" cy="8" r="3" fill="#f5b93a" />
      <rect x="13" y="16" width="38" height="32" rx="12" fill="white" stroke="#0f6b3e" strokeWidth="3" />
      <rect x="18" y="22" width="28" height="20" rx="8" fill="#0f6b3e" />
      <circle cx="26" cy="31" r="3" fill="white" />
      <circle cx="38" cy="31" r="3" fill="white" />
      <path d="M26 37 Q32 41 38 37" fill="none" stroke="white" strokeWidth="2" />
    </svg>
  );
}

// Bot reply logic
function getBotReply(text) {
  const message = text.toLowerCase();

  if (message === "hi" || message === "hello") return WELCOME;
  if (message.includes("how are you")) return "I'm doing great! How can I help you today?";
  if (message.includes("name")) return "My name is Cheeku!";
  return "That's interesting! Please tell me more.";
}

function Chatbot() {
  // Set to true so it opens immediately on screen
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ sender: "bot", text: WELCOME }]);

  // Auto-scroll to newest message
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  const sendMessage = () => {
    const userMessage = input.trim();
    if (!userMessage || isTyping) return;

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: getBotReply(userMessage) }]);
      setIsTyping(false);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([{ sender: "bot", text: WELCOME }]);
    setIsTyping(false);
  };

  // Closed state: Floating icon button
  if (!isOpen) {
    return (
      <button 
        type="button" 
        className="chat-icon" 
        onClick={() => setIsOpen(true)} 
        aria-label="Open chat"
      >
        <CheekuAvatar size={48} />
      </button>
    );
  }

  // Open state: Main chat window
  return (
    <div className={`chat-container ${isExpanded ? "expanded" : ""}`}>
      <div className="chat-header">
        <CheekuAvatar />
        <div className="chat-title">
          <h2>Cheeku</h2>
          <p>Padmasini assistant</p>
        </div>

        <button type="button" onClick={clearChat} title="Clear chat" aria-label="Clear chat">
          🗑
        </button>
        <button 
          type="button" 
          onClick={() => setIsExpanded(!isExpanded)} 
          title="Toggle Size" 
          aria-label="Expand or shrink chat"
        >
          {isExpanded ? "🗗" : "🗖"}
        </button>
        <button type="button" onClick={() => setIsOpen(false)} title="Close" aria-label="Close chat">
          ✕
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message-row ${message.sender}`}>
            {message.sender === "bot" && <CheekuAvatar size={28} />}
            <div className={`message ${message.sender}`}>{message.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message-row bot">
            <CheekuAvatar size={28} />
            <div className="message bot typing">
              Cheeku is thinking<span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button type="button" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
import { useEffect, useRef, useState } from "react";
import "./Chatbot.css";

const WELCOME = "Hi! I am Cheeku. Please tell me how I can help you.";

const DUMMY_REPLIES = [
  "Here is an alternative perspective on that!",
  "Let me rephrase that with more detail for you.",
  "Regenerated: This is a fresh response generated for testing.",
  "Here is another way to think about what you asked."
];

// Dummy historical conversations for frontend testing
const DUMMY_PREVIOUS_CHATS = [
  { id: 101, title: "Queries about admissions", date: "Yesterday" },
  { id: 102, title: "Course fee structures", date: "3 days ago" },
  { id: 103, title: "Campus facilities & hostel", date: "Last week" }
];

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
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: WELCOME, feedback: null }
  ]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Auto-scroll to newest message
  const bottomRef = useRef(null);
  useEffect(() => {
    if (!showHistory) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen, showHistory]);

  // Show greeting bubble for 4 seconds when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setShowGreeting(true);
      const t = setTimeout(() => setShowGreeting(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const sendMessage = () => {
    const userMessage = input.trim();
    if (!userMessage || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userMessage }
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: getBotReply(userMessage),
          feedback: null
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const clearChat = () => {
    setMessages([{ id: 1, sender: "bot", text: WELCOME, feedback: null }]);
    setIsTyping(false);
  };

  // 1. Copy Response
  const handleCopy = async (index, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // 2 & 3. Like / Dislike Response
  const handleFeedback = (index, type) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? { ...msg, feedback: msg.feedback === type ? null : type }
          : msg
      )
    );
  };

  // 4. Regenerate Response (Dummy Data)
  const handleRegenerate = (index) => {
    const randomReply =
      DUMMY_REPLIES[Math.floor(Math.random() * DUMMY_REPLIES.length)];
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? { ...msg, text: randomReply, feedback: null }
          : msg
      )
    );
  };

  // Switch to a previous chat
  const handleSelectChat = (chat) => {
    setMessages([
      { id: 1, sender: "user", text: `Loaded: ${chat.title}` },
      { id: 2, sender: "bot", text: `Resuming conversation from ${chat.date}. How can I assist further?`, feedback: null }
    ]);
    setShowHistory(false);
  };

  // Closed state
  if (!isOpen) {
    return (
      <div className="chat-launcher">
        {showGreeting && <div className="greeting-bubble">Hi, I'm Cheeku!</div>}
        <button
          type="button"
          className="chat-icon"
          onMouseEnter={() => setShowGreeting(true)}
          onMouseLeave={() => setShowGreeting(false)}
          onTouchStart={() => setShowGreeting(true)}
          onClick={() => {
            setShowGreeting(false);
            setIsOpen(true);
          }}
          aria-label="Open chat"
        >
          <CheekuAvatar size={48} />
        </button>
      </div>
    );
  }

  // Open state
  return (
    <div className={"chat-container " + (isExpanded ? "expanded" : "")}>
      <div className="chat-header">
        <CheekuAvatar />
        <div className="chat-title">
          <h2>Cheeku</h2>
          <p>Padmasini assistant</p>
        </div>

        {/* Previous Chats button inside chatbot box */}
        <button
          type="button"
          className={`chat-header-btn ${showHistory ? "active" : ""}`}
          onClick={() => setShowHistory(!showHistory)}
          title="Previous Chats"
          aria-label="Previous Chats"
        >
          💬 History
        </button>

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

      {showHistory ? (
        /* History View */
        <div className="history-view">
          <div className="history-header">
            <h4>Previous Conversations</h4>
            <button type="button" onClick={() => setShowHistory(false)}>Back to Chat</button>
          </div>
          <div className="history-list">
            {DUMMY_PREVIOUS_CHATS.map((chat) => (
              <div
                key={chat.id}
                className="history-item"
                onClick={() => handleSelectChat(chat)}
              >
                <div className="history-item-title">{chat.title}</div>
                <div className="history-item-date">{chat.date}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Standard Messages View */
        <>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={message.id || index} className={"message-row " + message.sender}>
                {message.sender === "bot" && <CheekuAvatar size={28} />}

                {message.sender === "bot" ? (
                  <div className="bot-message-wrapper">
                    <div className="message bot">{message.text}</div>
                    
                    {/* Action buttons below Cheeku's response */}
                    <div className="bot-actions">
                      <button
                        type="button"
                        className="bot-action-btn"
                        onClick={() => handleCopy(index, message.text)}
                        title="Copy response"
                      >
                        {copiedIndex === index ? "Copied!" : "📋 Copy"}
                      </button>

                      <button
                        type="button"
                        className={`bot-action-btn ${message.feedback === "like" ? "active-like" : ""}`}
                        onClick={() => handleFeedback(index, "like")}
                        title="Like response"
                      >
                        👍
                      </button>

                      <button
                        type="button"
                        className={`bot-action-btn ${message.feedback === "dislike" ? "active-dislike" : ""}`}
                        onClick={() => handleFeedback(index, "dislike")}
                        title="Dislike response"
                      >
                        👎
                      </button>

                      <button
                        type="button"
                        className="bot-action-btn"
                        onClick={() => handleRegenerate(index)}
                        title="Regenerate response"
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="message user">{message.text}</div>
                )}
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
        </>
      )}
    </div>
  );
}

export default Chatbot;

import { useEffect, useRef, useState } from "react";
import "./Chatbot.css";

const API_URL = "http://localhost:5000";

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

  // Real chat history from Flask backend
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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

  // Fetch chat history from Flask backend
  const fetchChatHistory = async () => {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_URL}/history`);

      if (!response.ok) {
        throw new Error("Failed to fetch chat history.");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid chat history response.");
      }

      setChatHistory(data);
    } catch (error) {
      console.error("History API Error:", error);

      setHistoryError(
        "Unable to load chat history. Please check your backend connection."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // Open or close history and fetch real data
  const handleHistoryClick = async () => {
    if (showHistory) {
      setShowHistory(false);
    } else {
      setShowHistory(true);
      await fetchChatHistory();
    }
  };

  // Send message to Flask backend
  const sendMessage = async (messageText = input) => {
    const userMessage = messageText.trim();

    if (!userMessage || isTyping) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: userMessage
      }
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot.");
      }

      const data = await response.json();

      if (typeof data.reply !== "string") {
        throw new Error("Invalid chatbot response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data.reply,
          requestText: userMessage,
          feedback: null
        }
      ]);

    } catch (error) {
      console.error("Chat API Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Sorry, something went wrong. Please check your connection and try again.",
          requestText: userMessage,
          feedback: null
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([
      { id: 1, sender: "bot", text: WELCOME, feedback: null }
    ]);

    setIsTyping(false);
    setInput("");
  };

  // 1. Copy Response
  const handleCopy = async (index, text) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      setTimeout(() => setCopiedIndex(null), 2000);

    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // 2 & 3. Like / Dislike Response
  const handleFeedback = (index, type) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? {
              ...msg,
              feedback: msg.feedback === type ? null : type
            }
          : msg
      )
    );
  };

  // 4. Regenerate Response using Flask API
  const handleRegenerate = async (index) => {
    const botMessage = messages[index];

    if (!botMessage || !botMessage.requestText || isTyping) return;

    const originalMessage = botMessage.requestText;

    setIsTyping(true);

    // Clear previous response while regenerating
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? { ...msg, text: "Regenerating response...", feedback: null }
          : msg
      )
    );

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: originalMessage
        })
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate response.");
      }

      const data = await response.json();

      if (typeof data.reply !== "string") {
        throw new Error("Invalid chatbot response.");
      }

      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index
            ? {
                ...msg,
                text: data.reply,
                feedback: null
              }
            : msg
        )
      );

    } catch (error) {
      console.error("Regenerate API Error:", error);

      setMessages((prev) =>
        prev.map((msg, i) =>
          i === index
            ? {
                ...msg,
                text: "Sorry, unable to regenerate the response. Please try again.",
                feedback: null
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Format history timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Date unavailable";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleString();
  };

  // Load a previous conversation entry
  const handleSelectChat = (chat) => {
    setMessages([
      {
        id: Date.now(),
        sender: "user",
        text: chat.user_message
      },
      {
        id: Date.now() + 1,
        sender: "bot",
        text: chat.ai_response,
        requestText: chat.user_message,
        feedback: null
      }
    ]);

    setShowHistory(false);
  };

  // Closed state
  if (!isOpen) {
    return (
      <div className="chat-launcher">
        {showGreeting && (
          <div className="greeting-bubble">Hi, I'm Cheeku!</div>
        )}

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

        {/* Previous Chats button */}
        <button
          type="button"
          className={`chat-header-btn ${showHistory ? "active" : ""}`}
          onClick={handleHistoryClick}
          title="Previous Chats"
          aria-label="Previous Chats"
        >
          💬 History
        </button>

        <button
          type="button"
          onClick={clearChat}
          title="Clear chat"
          aria-label="Clear chat"
        >
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

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          title="Close"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {showHistory ? (
        /* History View */
        <div className="history-view">
          <div className="history-header">
            <h4>Previous Conversations</h4>

            <button
              type="button"
              onClick={() => setShowHistory(false)}
            >
              Back to Chat
            </button>
          </div>

          <div className="history-list">
            {historyLoading ? (
              <div className="history-item">
                Loading chat history...
              </div>
            ) : historyError ? (
              <div className="history-item">
                {historyError}
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="history-item">
                No previous conversations found.
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div
                  key={chat._id || index}
                  className="history-item"
                  onClick={() => handleSelectChat(chat)}
                >
                  <div className="history-item-title">
                    {chat.user_message}
                  </div>

                  <div className="history-item-date">
                    {formatTimestamp(chat.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Standard Messages View */
        <>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={"message-row " + message.sender}
              >
                {message.sender === "bot" && (
                  <CheekuAvatar size={28} />
                )}

                {message.sender === "bot" ? (
                  <div className="bot-message-wrapper">
                    <div className="message bot">
                      {message.text}
                    </div>

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
                        className={`bot-action-btn ${
                          message.feedback === "like" ? "active-like" : ""
                        }`}
                        onClick={() => handleFeedback(index, "like")}
                        title="Like response"
                      >
                        👍
                      </button>

                      <button
                        type="button"
                        className={`bot-action-btn ${
                          message.feedback === "dislike" ? "active-dislike" : ""
                        }`}
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
                        disabled={isTyping || !message.requestText}
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="message user">
                    {message.text}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="message-row bot">
                <CheekuAvatar size={28} />

                <div className="message bot typing">
                  Cheeku is thinking
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
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

            <button
              type="button"
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Chatbot;

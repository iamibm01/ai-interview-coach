"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
const interviewTypes = [
  {
    id: "frontend",
    label: "Frontend",
    icon: "🎨",
    description: "HTML, CSS, React, performance",
  },
  {
    id: "backend",
    label: "Backend",
    icon: "⚙️",
    description: "APIs, databases, server logic",
  },
  {
    id: "fullstack",
    label: "Full-Stack",
    icon: "🚀",
    description: "End-to-end system design",
  },
  {
    id: "behavioural",
    label: "Behavioural",
    icon: "🧠",
    description: "Soft skills, STAR method",
  },
];

export default function Home() {
  const [interviewType, setInterviewType] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

 const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ 
    api: "/api/chat",
    body: { interviewType },
  }),
});

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startSession(type: string) {
    setInterviewType(type);
    setSessionStarted(true);
  }

  function endSession() {
    setSessionStarted(false);
    setInterviewType(null);
    setInput("");
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage({ text: trimmed });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // --- SELECTION SCREEN ---
  if (!sessionStarted) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold mb-2">AI Interview Coach</h1>
          <p className="text-gray-400 mb-12 text-lg">
            Practice technical interviews with real-time AI feedback
          </p>
          <div className="grid grid-cols-2 gap-4">
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => startSession(type.id)}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-xl p-6 text-left transition-all duration-200"
              >
                <div className="text-3xl mb-3">{type.icon}</div>
                <div className="font-semibold text-lg">{type.label}</div>
                <div className="text-gray-400 text-sm mt-1">
                  {type.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // --- CHAT SCREEN ---
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">AI Interview Coach</h1>
          <p className="text-gray-400 text-sm capitalize">
            {interviewType} Interview
          </p>
        </div>
        <button
          onClick={endSession}
          className="text-gray-400 hover:text-white text-sm border border-gray-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          New Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg">Ready when you are.</p>
            <p className="text-sm mt-2">
              Type anything to start your interview.
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-100"
              }`}
            >
              {message.parts?.map((part, i) => {
                if (part.type === "text")
                  return <span key={i}>{part.text}</span>;
                return null;
              })}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            rows={3}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input?.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl px-5 font-medium transition-colors self-end py-3"
          >
            Send
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </main>
  );
}

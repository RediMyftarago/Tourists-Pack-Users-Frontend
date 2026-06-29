"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Headset } from "lucide-react";
import logo from "../public/assets/vodafone-logo.png";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hi, I am your Vodafone assistant. Ask me about tourist packs, activation, discounts, or account help.",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800";

export default function AssistantChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [isSending, setIsSending] = useState(false);

  const assistantStatus = useMemo(() => (open ? "Assistant chat open" : "Open assistant chat"), [open]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = { id: Date.now(), role: "user", text };
    const loadingMessage: ChatMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: "Thinking...",
    };

    setIsSending(true);
    setMessages((current) => [
      ...current,
      userMessage,
      loadingMessage,
    ]);
    setDraft("");

    try {
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const body = await response.json().catch(() => null) as { answer?: string; message?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.message || body?.error || `Assistant returned ${response.status}`);
      }

      const answer = body?.answer?.trim() || "I could not create a response. Please try again.";

      setMessages((current) =>
        current.map((message) =>
          message.id === loadingMessage.id ? { ...message, text: answer } : message
        )
      );
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Assistant is unavailable right now.";
      setMessages((current) =>
        current.map((message) =>
          message.id === loadingMessage.id ? { ...message, text: fallback } : message
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="assistant-widget">
      {open && (
        <section className="assistant-panel" aria-label="Vodafone assistant chat">
          <header className="assistant-header">
            <div className="assistant-mark" aria-hidden="true">AI</div>
            <div>
              <strong>Vodafone Assistant</strong>
              <span>Online support</span>
            </div>
            <button type="button" className="assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant">
              X
            </button>
          </header>

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`assistant-message ${message.role}`} key={message.id}>
                {message.text}
              </div>
            ))}
          </div>

          <form className="assistant-input-row" onSubmit={sendMessage}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message"
              aria-label="Message Vodafone assistant"
            />
            <button type="submit" disabled={isSending}>{isSending ? "..." : "Send"}</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="assistant-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label={assistantStatus}
        aria-expanded={open}
      >
        <span className="assistant-fab-icon" aria-hidden="true">
          <Image src={logo} alt="" width={34} height={34} />
          <span className="assistant-fab-badge">
            <Headset size={16} />
          </span>
        </span>
        <span className="assistant-fab-text">Assistant</span>
      </button>
    </div>
  );
}

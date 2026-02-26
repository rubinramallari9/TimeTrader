"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { messagesApi } from "@/lib/messages-api";
import { ConversationDetail, Message } from "@/types";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const [conv, setConv] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConv = useCallback(async () => {
    const { data } = await messagesApi.get(id);
    setConv(data);
  }, [id]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login"); return; }

    fetchConv().finally(() => setLoading(false));

    // Poll for new messages every 4 seconds
    pollRef.current = setInterval(fetchConv, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id, isInitialized, user, router, fetchConv]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic update
    if (conv && user) {
      const optimistic: Message = {
        id: `temp-${Date.now()}`,
        sender: { id: user.id, username: user.username, full_name: user.username, avatar_url: "", role: user.role, is_verified: false, created_at: "" },
        content: text,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setConv((prev) => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);
    }

    try {
      await messagesApi.send(id, text);
      await fetchConv();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isInitialized || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-3">
        <div className="h-14 bg-[#EDE9E3] rounded-2xl" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 bg-[#EDE9E3] rounded-2xl" style={{ width: `${50 + i * 15}%` }} />)}
        </div>
      </div>
    );
  }

  if (!conv) return null;

  const other = user?.id === conv.buyer.id ? conv.seller : conv.buyer;

  // Group messages by day
  const grouped: { day: string; messages: Message[] }[] = [];
  for (const msg of conv.messages) {
    const day = formatDay(msg.created_at);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) last.messages.push(msg);
    else grouped.push({ day, messages: [msg] });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-[#EDE9E3] rounded-2xl px-4 py-3 mb-4 flex-shrink-0">
        <Link href="/messages" className="text-[#9E9585] hover:text-[#0E1520] transition-colors mr-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#B09145] flex items-center justify-center text-sm font-bold uppercase text-white flex-shrink-0">
          {other.username[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0E1520] truncate">{other.username}</p>
          <Link href={`/listings/${conv.listing_id}`} className="text-[10px] text-[#B09145] hover:underline truncate block">
            {conv.listing_brand} · {conv.listing_title}
          </Link>
        </div>
        <Link href={`/listings/${conv.listing_id}`} className="flex-shrink-0 tt-btn-outline text-xs py-1.5 px-3 rounded-lg hidden sm:block">
          View Listing
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {grouped.map(({ day, messages }) => (
          <div key={day}>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-[#EDE9E3]" />
              <span className="text-[10px] text-[#9E9585] font-medium">{day}</span>
              <div className="flex-1 h-px bg-[#EDE9E3]" />
            </div>
            <div className="space-y-2">
              {messages.map((msg) => {
                const isMe = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-[#B09145] flex items-center justify-center text-xs font-bold uppercase text-white flex-shrink-0 mr-2 mt-1">
                        {msg.sender.username[0]}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-[#0E1520] text-white rounded-br-sm"
                          : "bg-white border border-[#EDE9E3] text-[#0E1520] rounded-bl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#9E9585] mt-1 px-1">
                        {formatTime(msg.created_at)}
                        {isMe && (
                          <span className="ml-1">{msg.is_read ? "· Read" : ""}</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 flex items-end gap-2 bg-white border border-[#EDE9E3] rounded-2xl px-4 py-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[#0E1520] placeholder-[#C8C0B0] focus:outline-none max-h-32"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-xl bg-[#B09145] flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#C8A96E] transition-colors"
          aria-label="Send"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

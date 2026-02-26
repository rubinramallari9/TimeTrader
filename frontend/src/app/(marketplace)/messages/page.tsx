"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { messagesApi } from "@/lib/messages-api";
import { Conversation } from "@/types";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.push("/login?from=/messages"); return; }
    messagesApi.list()
      .then(({ data }) => setConversations(data))
      .finally(() => setLoading(false));
  }, [isInitialized, user, router]);

  if (!isInitialized || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 bg-[#EDE9E3] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-[#0E1520] mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#C8C0B0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <p className="text-[#9E9585] text-sm">No conversations yet.</p>
          <Link href="/listings" className="inline-block mt-4 tt-btn-gold py-2 px-5 rounded-xl text-sm">
            Browse Watches
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = user?.id === conv.buyer.id ? conv.seller : conv.buyer;
            const hasUnread = conv.unread_count > 0;
            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-4 bg-white border border-[#EDE9E3] hover:border-[#B09145]/40 rounded-2xl px-4 py-3.5 transition-all group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#B09145] flex items-center justify-center text-sm font-bold uppercase text-white flex-shrink-0">
                  {other.username[0]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${hasUnread ? "font-bold text-[#0E1520]" : "font-medium text-[#0E1520]"}`}>
                      {other.username}
                    </p>
                    <span className="text-[10px] text-[#9E9585] flex-shrink-0">
                      {conv.last_message ? timeAgo(conv.last_message.created_at) : timeAgo(conv.created_at)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#B09145] font-medium truncate mb-0.5">
                    {conv.listing_brand} · {conv.listing_title}
                  </p>
                  <p className={`text-xs truncate ${hasUnread ? "text-[#0E1520] font-medium" : "text-[#9E9585]"}`}>
                    {conv.last_message?.content ?? "Conversation started"}
                  </p>
                </div>

                {/* Unread badge */}
                {hasUnread && (
                  <div className="w-5 h-5 rounded-full bg-[#B09145] flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-white">{conv.unread_count}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

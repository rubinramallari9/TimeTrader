import { api } from "./api";
import { Conversation, ConversationDetail, Message } from "@/types";

export const messagesApi = {
  list: () =>
    api.get<Conversation[]>("/messages/conversations/"),

  start: (listing_id: string, message: string) =>
    api.post<ConversationDetail>("/messages/conversations/", { listing_id, message }),

  get: (id: string) =>
    api.get<ConversationDetail>(`/messages/conversations/${id}/`),

  send: (id: string, content: string) =>
    api.post<Message>(`/messages/conversations/${id}/messages/`, { content }),

  unread: () =>
    api.get<{ unread: number }>("/messages/unread/"),
};

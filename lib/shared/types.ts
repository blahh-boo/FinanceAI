export type Role = "user" | "assistant";

export interface Citation {
  index: number;
  url: string;
  title: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  citations: Citation[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

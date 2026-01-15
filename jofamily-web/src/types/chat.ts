export type ChatThread = {
  id: string;
  name: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  lastMessagePreview?: string;
  members?: string[];
  pinnedBy?: string[];
  mutedBy?: string[];
  isPinned?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  authorId: string;
  authorName?: string | null;
  text: string;
  createdAt?: Date | null;
  status?: 'sent' | 'seen';
  mediaUrl?: string | null;
};

export type CreateThreadInput = {
  name: string;
  members?: string[];
};

export type SendMessageInput = {
  threadId: string;
  authorId: string;
  authorName?: string | null;
  text: string;
  mediaUrl?: string | null;
};

export type TypingState = {
  userId: string;
  userName?: string | null;
  updatedAt: Date | null;
};

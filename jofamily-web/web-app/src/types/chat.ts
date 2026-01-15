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
  reactions?: MessageReaction[];
  replyToId?: string | null;
  replyToText?: string | null;
  replyToAuthor?: string | null;
  readBy?: Record<string, number>; // userId -> timestamp of when read
  isEdited?: boolean;
  editedAt?: Date | null;
  editHistory?: { text: string; editedAt: Date }[];
};

export type MessageReaction = {
  emoji: string;
  userId: string;
  userName?: string | null;
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
  replyToId?: string | null;
  replyToText?: string | null;
  replyToAuthor?: string | null;
};

export type MessageSearchParams = {
  threadId: string;
  query: string;
  authorId?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type TypingState = {
  userId: string;
  userName?: string | null;
  updatedAt: Date | null;
};

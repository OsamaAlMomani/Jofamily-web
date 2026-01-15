import { useEffect, useMemo, useState } from 'react';
import './Chat.css';
import { useAuth } from '../../core';
import {
  createThread,
  deleteMessage,
  getUnreadCount,
  listenToMessages,
  listenToThreads,
  listenToTyping,
  markMessagesSeen,
  sendMessage,
  setTyping,
  toggleMuteThread,
  togglePinThread,
} from '../../services';
import type { ChatMessage, ChatThread, TypingState } from '../../types/chat';

export default function Chat() {
  const { user } = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newThreadName, setNewThreadName] = useState('');
  const [draft, setDraft] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [typing, setTypingState] = useState<TypingState[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const unsub = listenToThreads((list) => {
      setThreads(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    const unsub = listenToMessages(activeThreadId, setMessages);
    return () => unsub();
  }, [activeThreadId]);

  useEffect(() => {
    if (!activeThreadId) return;
    const unsub = listenToTyping(activeThreadId, setTypingState);
    return () => unsub();
  }, [activeThreadId]);

  const decoratedThreads = useMemo(() => {
    if (!user) return threads;
    const withFlags = threads.map((t) => ({
      ...t,
      isPinned: t.pinnedBy?.includes(user.uid) ?? false,
      isMuted: t.mutedBy?.includes(user.uid) ?? false,
      unreadCount: unreadCounts.get(t.id) ?? 0,
    }));
    return withFlags.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const aTime = a.updatedAt?.getTime?.() ?? 0;
      const bTime = b.updatedAt?.getTime?.() ?? 0;
      return bTime - aTime;
    });
  }, [threads, user, unreadCounts]);

  useEffect(() => {
    if (!user) return;
    const loadCounts = async () => {
      const newCounts = new Map<string, number>();
      for (const t of threads) {
        const count = await getUnreadCount(t.id, user.uid);
        newCounts.set(t.id, count);
      }
      setUnreadCounts(newCounts);
    };
    void loadCounts();
  }, [threads, user]);

  useEffect(() => {
    if (!activeThreadId && decoratedThreads.length > 0) {
      setActiveThreadId(decoratedThreads[0].id);
    }
  }, [decoratedThreads, activeThreadId]);

  useEffect(() => {
    if (!activeThreadId || !user) return;
    void markMessagesSeen(activeThreadId, user.uid).then(() => {
      setUnreadCounts((prev) => {
        const next = new Map(prev);
        next.set(activeThreadId, 0);
        return next;
      });
    });
  }, [activeThreadId, messages.length, user]);

  const activeThread = useMemo(() => {
    return decoratedThreads.find((th) => th.id === activeThreadId) ?? null;
  }, [decoratedThreads, activeThreadId]);

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!newThreadName.trim()) return;
    setCreating(true);
    try {
      const id = await createThread({ name: newThreadName.trim(), members: [user.uid] });
      setActiveThreadId(id);
      setNewThreadName('');
    } finally {
      setCreating(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !activeThreadId || (!draft.trim() && !mediaUrl.trim())) return;
    setSending(true);
    try {
      await sendMessage({
        threadId: activeThreadId,
        authorId: user.uid,
        authorName: user.email ?? 'You',
        text: draft.trim(),
        mediaUrl: mediaUrl.trim() || null,
      });
      setDraft('');
      setMediaUrl('');
      void setTyping(activeThreadId, user.uid, false, user.email);
    } finally {
      setSending(false);
    }
  }

  function handleTyping(value: string) {
    setDraft(value);
    if (!user || !activeThreadId) return;
    void setTyping(activeThreadId, user.uid, !!value.trim(), user.email);
  }

  useEffect(() => {
    return () => {
      if (activeThreadId && user) {
        void setTyping(activeThreadId, user.uid, false, user.email);
      }
    };
  }, [activeThreadId, user]);

  async function handleTogglePin() {
    if (!user || !activeThread) return;
    await togglePinThread(activeThread.id, user.uid, !!activeThread.isPinned);
  }

  async function handleToggleMute() {
    if (!user || !activeThread) return;
    await toggleMuteThread(activeThread.id, user.uid, !!activeThread.isMuted);
  }

  async function handleDeleteMessage(msg: ChatMessage) {
    if (!user || msg.authorId !== user.uid) return;
    await deleteMessage(msg.threadId, msg.id);
  }

  if (!user) {
    return (
      <div className="chat-page">
        <header className="chat-hero">
          <div className="chat-hero__content">
            <p className="eyebrow">Feature 1 · Sign in required</p>
            <h1>Real-Time Family Chat</h1>
            <p className="lede">Please sign in to start chatting with your family.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <header className="chat-hero">
        <div className="chat-hero__content">
          <p className="eyebrow">Feature 1 · In Progress</p>
          <h1>Real-Time Family Chat</h1>
          <p className="lede">
            A private, real-time messaging hub for families. Built for safety, clarity, and fast
            coordination—today with text, tomorrow with voice and video.
          </p>
          <div className="pill-row">
            <span className="pill pill--in-progress">In Progress</span>
            <span className="pill pill--phase">Phase 1 Scope</span>
          </div>
        </div>
      </header>

      <section className="chat-layout">
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <h2>Threads</h2>
            <form className="create-thread" onSubmit={handleCreateThread}>
              <input
                type="text"
                placeholder="New thread name"
                value={newThreadName}
                onChange={(e) => setNewThreadName(e.target.value)}
              />
              <button type="submit" disabled={!newThreadName.trim() || creating}>
                {creating ? 'Adding…' : 'Add'}
              </button>
            </form>
          </div>

          <div className="thread-list">
            {decoratedThreads.length === 0 && <p className="muted">No threads yet. Create one above.</p>}
            {decoratedThreads.map((thread) => (
              <button
                key={thread.id}
                className={`thread-item ${thread.id === activeThreadId ? 'thread-item--active' : ''}`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <div className="thread-name">{thread.name}</div>
                <div className="thread-flags">
                  {thread.isPinned && <span className="flag-badge">Pinned</span>}
                  {thread.isMuted && <span className="flag-badge flag-badge--muted">Muted</span>}
                  {(thread.unreadCount ?? 0) > 0 && (
                    <span className="flag-badge flag-badge--unread">{thread.unreadCount}</span>
                  )}
                </div>
                {thread.lastMessagePreview && (
                  <div className="thread-preview">{thread.lastMessagePreview}</div>
                )}
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          <div className="chat-main__header">
            <div>
              <p className="eyebrow">Thread</p>
              <h2>{activeThread?.name ?? 'Select a thread'}</h2>
            </div>
            {activeThread && (
              <div className="thread-actions">
                <button
                  type="button"
                  className={`pill pill--action ${activeThread.isPinned ? 'pill--on' : ''}`}
                  onClick={handleTogglePin}
                >
                  {activeThread.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  type="button"
                  className={`pill pill--action ${activeThread.isMuted ? 'pill--on' : ''}`}
                  onClick={handleToggleMute}
                >
                  {activeThread.isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {activeThreadId ? (
              messages.length === 0 ? (
                <div className="muted">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.authorId === user.uid ? 'message--mine' : ''}`}>
                    <div className="message-author">{msg.authorName ?? 'Unknown'}</div>
                    <div className="message-text">{msg.text}</div>
                    {msg.mediaUrl && (
                      <a className="message-media" href={msg.mediaUrl} target="_blank" rel="noreferrer">
                        View attachment
                      </a>
                    )}
                    <div className="message-meta">
                      {msg.createdAt
                        ? msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'pending'}{' '}
                      · {msg.status === 'seen' ? 'Seen' : 'Sent'}
                    </div>
                    {msg.authorId === user.uid && (
                      <button type="button" className="message-delete" onClick={() => handleDeleteMessage(msg)}>
                        Delete
                      </button>
                    )}
                  </div>
                ))
              )
            ) : (
              <div className="muted">Select or create a thread to begin.</div>
            )}
            {activeThreadId && typing.filter((t) => t.userId !== user.uid).length > 0 && (
              <div className="typing-row">
                {typing
                  .filter((t) => t.userId !== user.uid)
                  .map((t) => t.userName ?? 'Someone')
                  .join(', ')}{' '}
                {typing.filter((t) => t.userId !== user.uid).length === 1 ? 'is' : 'are'} typing…
              </div>
            )}
          </div>

          <form className="chat-composer" onSubmit={handleSend}>
            <input
              type="text"
              placeholder={activeThreadId ? 'Type a message…' : 'Select a thread first'}
              value={draft}
              onChange={(e) => handleTyping(e.target.value)}
              onBlur={() => {
                if (activeThreadId && user) {
                  void setTyping(activeThreadId, user.uid, false, user.email);
                }
              }}
              disabled={!activeThreadId}
            />
            <input
              type="url"
              placeholder="Optional image/file URL"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              disabled={!activeThreadId}
            />
            <button type="submit" disabled={!activeThreadId || (!draft.trim() && !mediaUrl.trim()) || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </main>
      </section>
    </div>
  );
}

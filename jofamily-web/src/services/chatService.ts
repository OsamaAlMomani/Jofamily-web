import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  ChatMessage,
  ChatThread,
  CreateThreadInput,
  SendMessageInput,
  TypingState,
} from '../types/chat';

const threadsCollection = collection(db, 'chatThreads');

const threadDoc = (threadId: string) => doc(db, 'chatThreads', threadId);
const messagesCollection = (threadId: string) => collection(threadDoc(threadId), 'messages');
const typingCollection = (threadId: string) => collection(threadDoc(threadId), 'typing');

export function listenToThreads(callback: (threads: ChatThread[]) => void) {
  const q = query(threadsCollection, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const threads: ChatThread[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : createdAt;
      return {
        id: d.id,
        name: data.name ?? 'Untitled',
        members: data.members ?? [],
        lastMessagePreview: data.lastMessagePreview ?? '',
        pinnedBy: data.pinnedBy ?? [],
        mutedBy: data.mutedBy ?? [],
        createdAt,
        updatedAt,
      };
    });
    callback(threads);
  });
}

export async function createThread(input: CreateThreadInput) {
  const now = serverTimestamp();
  const ref = await addDoc(threadsCollection, {
    name: input.name,
    members: input.members ?? [],
    createdAt: now,
    updatedAt: now,
    lastMessagePreview: '',
    pinnedBy: [],
    mutedBy: [],
  });
  return ref.id;
}

export function listenToMessages(threadId: string, callback: (messages: ChatMessage[]) => void) {
  const q = query(messagesCollection(threadId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const messages: ChatMessage[] = snap.docs.map((d) => {
      const data = d.data();
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
      return {
        id: d.id,
        threadId,
        authorId: data.authorId ?? 'unknown',
        authorName: data.authorName ?? 'Unknown',
        text: data.text ?? '',
        status: (data.status as ChatMessage['status']) ?? 'sent',
        mediaUrl: data.mediaUrl ?? null,
        createdAt,
      };
    });
    callback(messages);
  });
}

export async function sendMessage(input: SendMessageInput) {
  const now = serverTimestamp();
  await addDoc(messagesCollection(input.threadId), {
    authorId: input.authorId,
    authorName: input.authorName ?? null,
    text: input.text,
    mediaUrl: input.mediaUrl ?? null,
    createdAt: now,
    status: 'sent',
  });
  await setDoc(
    threadDoc(input.threadId),
    {
      updatedAt: now,
      lastMessagePreview: input.text,
    },
    { merge: true }
  );
}

export async function markMessagesSeen(threadId: string, userId: string) {
  const snap = await getDocs(messagesCollection(threadId));
  const updates: Promise<unknown>[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.authorId !== userId && data.status !== 'seen') {
      updates.push(updateDoc(docSnap.ref, { status: 'seen' }));
    }
  });
  await Promise.all(updates);
}

export async function deleteMessage(threadId: string, messageId: string) {
  const ref = doc(messagesCollection(threadId), messageId);
  await setDoc(ref, { text: '[deleted]', mediaUrl: null }, { merge: true });
}

export async function togglePinThread(threadId: string, userId: string, isPinned: boolean) {
  await updateDoc(threadDoc(threadId), {
    pinnedBy: isPinned ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function toggleMuteThread(threadId: string, userId: string, isMuted: boolean) {
  await updateDoc(threadDoc(threadId), {
    mutedBy: isMuted ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function setTyping(
  threadId: string,
  userId: string,
  isTyping: boolean,
  userName?: string | null
) {
  const ref = doc(typingCollection(threadId), userId);
  if (isTyping) {
    await setDoc(ref, { updatedAt: serverTimestamp(), userName: userName ?? null });
  } else {
    await setDoc(ref, { updatedAt: null }, { merge: true });
  }
}

export function listenToTyping(threadId: string, callback: (typing: TypingState[]) => void) {
  return onSnapshot(typingCollection(threadId), (snap) => {
    const result: TypingState[] = snap.docs.map((d) => {
      const data = d.data();
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null;
      return { userId: d.id, userName: data.userName ?? null, updatedAt };
    });
    callback(result);
  });
}

export async function getUnreadCount(threadId: string, userId: string): Promise<number> {
  const snap = await getDocs(messagesCollection(threadId));
  let count = 0;
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.authorId !== userId && data.status !== 'seen') {
      count++;
    }
  });
  return count;
}

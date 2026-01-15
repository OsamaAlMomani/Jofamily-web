// Firestore signaling helpers for WebRTC rooms.
//
// Data model used by this project:
// - rooms/{roomId} contains offer + answer
// - rooms/{roomId}/callerCandidates contains ICE candidates from the caller
// - rooms/{roomId}/calleeCandidates contains ICE candidates from the callee

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';

export type SignalingRole = 'caller' | 'callee';
export type CandidateCollectionName = 'callerCandidates' | 'calleeCandidates';

export function getRoomRef(db: Firestore, roomId: string) {
  return doc(db, 'rooms', roomId);
}

export async function createRoomDoc(
  db: Firestore,
  roomId: string,
  displayName: string,
  offer: RTCSessionDescriptionInit
) {
  const roomRef = getRoomRef(db, roomId);
  await setDoc(roomRef, {
    createdAt: serverTimestamp(),
    createdBy: displayName || null,
    offer,
  });
  return roomRef;
}

export async function writeRoomAnswer(
  db: Firestore,
  roomId: string,
  displayName: string,
  answer: RTCSessionDescriptionInit
) {
  const roomRef = getRoomRef(db, roomId);
  await updateDoc(roomRef, {
    answeredAt: serverTimestamp(),
    answeredBy: displayName || null,
    answer,
  });
}

export function listenForAnswer(
  db: Firestore,
  roomId: string,
  onAnswer: (answer: RTCSessionDescriptionInit) => void | Promise<void>
): Unsubscribe {
  const roomRef = getRoomRef(db, roomId);
  return onSnapshot(roomRef, (snap) => {
    const data = snap.data() as { answer?: RTCSessionDescriptionInit } | undefined;
    if (!data?.answer) return;
    void onAnswer(data.answer);
  });
}

export function listenForCandidates(
  db: Firestore,
  roomId: string,
  collectionName: CandidateCollectionName,
  onCandidate: (candidate: RTCIceCandidateInit) => void
): Unsubscribe {
  return onSnapshot(collection(db, 'rooms', roomId, collectionName), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type !== 'added') return;
      onCandidate(change.doc.data() as RTCIceCandidateInit);
    });
  });
}

export async function writeCandidate(
  db: Firestore,
  roomId: string,
  collectionName: CandidateCollectionName,
  candidateJson: RTCIceCandidateInit
) {
  await addDoc(collection(db, 'rooms', roomId, collectionName), candidateJson);
}

export async function deleteRoom(db: Firestore, roomId: string) {
  await deleteDoc(getRoomRef(db, roomId));
}

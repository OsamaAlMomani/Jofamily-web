import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface FamilyMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export function listenToFamilyMembers(familyId: string, callback: (members: FamilyMember[]) => void) {
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('familyId', '==', familyId));
  
  return onSnapshot(q, (snap) => {
    const members: FamilyMember[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        displayName: data.displayName ?? 'Unknown',
        email: data.email ?? '',
        photoURL: data.photoURL ?? undefined,
      };
    });
    callback(members);
  });
}

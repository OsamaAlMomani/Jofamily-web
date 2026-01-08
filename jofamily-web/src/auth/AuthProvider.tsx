import { useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      loading,
      loginWithEmail: async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
      },
      signupWithEmail: async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
      },
      loginWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
      },
      logout: async () => {
        await signOut(auth);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

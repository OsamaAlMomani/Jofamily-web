import { FirebaseError } from 'firebase/app';

export function authErrorMessage(error: unknown, fallback: string) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/configuration-not-found':
        return 'Firebase Authentication configuration was not found for this project. In Firebase Console: Authentication → Get started (enable Auth), then Authentication → Sign-in method → enable Google. Also verify your `VITE_FIREBASE_*` env vars all come from the same Firebase project (especially `VITE_FIREBASE_AUTH_DOMAIN` and `VITE_FIREBASE_API_KEY`).';
      case 'auth/unauthorized-domain':
        return 'Google sign-in is blocked for this domain. Add this domain to Firebase Console → Authentication → Settings → Authorized domains.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled. Enable Google provider in Firebase Console → Authentication → Sign-in method.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked. Please allow popups for this site and try again.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completing. Please try again.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in popup is already open. Close it and try again.';
      case 'auth/network-request-failed':
        return 'Network error while signing in. Check your connection and try again.';
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

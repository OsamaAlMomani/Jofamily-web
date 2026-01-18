import type { User } from 'firebase/auth';

// Admin user credentials - in production, store this in Firestore/env
const ADMIN_EMAIL = 'momani.322.44157@gmail.com';

/**
 * Check if the current user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Get admin role information
 */
export function getAdminRole(user: User | null): 'admin' | 'user' | null {
  if (!user) return null;
  return isAdmin(user) ? 'admin' : 'user';
}

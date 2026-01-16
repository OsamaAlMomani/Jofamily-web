/**
 * Firebase Mocks for Testing
 * Provides mock implementations of Firebase services for unit tests
 * without requiring actual Firebase credentials or network calls
 */

import { vi } from 'vitest';
import type { Auth, User, UserCredential } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

/**
 * Mock Firebase User object
 */
export const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: '2025-01-01T00:00:00.000Z',
    lastSignInTime: '2025-01-15T00:00:00.000Z',
  },
  providerData: [],
  phoneNumber: null,
  refreshToken: 'mock-refresh-token',
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
} as unknown as User;

/**
 * Mock Firebase UserCredential object
 */
export const mockUserCredential: UserCredential = {
  user: mockUser,
  providerId: 'password',
  operationType: 'signIn',
} as UserCredential;

/**
 * Mock Auth instance
 */
export const mockAuth: Partial<Auth> = {
  currentUser: mockUser,
};

/**
 * Mock Firestore instance
 */
export const mockFirestore: Partial<Firestore> = {};

/**
 * Create a mock auth service for testing
 * Use this to mock Firebase Auth methods
 */
export const createMockAuthService = () => ({
  signInWithEmailAndPassword: vi.fn().mockResolvedValue(mockUserCredential),
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue(mockUserCredential),
  signInWithPopup: vi.fn().mockResolvedValue(mockUserCredential),
  signOut: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn((callback) => {
    callback(mockUser);
    return vi.fn(); // unsubscribe function
  }),
});

/**
 * Setup Firebase mocks for tests
 * Call this in your test setup file
 */
export const setupFirebaseMocks = () => {
  // Mock firebase/app
  vi.mock('firebase/app', () => ({
    initializeApp: vi.fn().mockReturnValue({}),
    getApps: vi.fn().mockReturnValue([]),
  }));

  // Mock firebase/auth
  vi.mock('firebase/auth', () => ({
    getAuth: vi.fn().mockReturnValue(mockAuth),
    signInWithEmailAndPassword: vi
      .fn()
      .mockResolvedValue(mockUserCredential),
    createUserWithEmailAndPassword: vi
      .fn()
      .mockResolvedValue(mockUserCredential),
    signInWithPopup: vi.fn().mockResolvedValue(mockUserCredential),
    signOut: vi.fn().mockResolvedValue(undefined),
    onAuthStateChanged: vi.fn((_auth, callback) => {
      callback(mockUser);
      return vi.fn(); // unsubscribe function
    }),
  }));

  // Mock firebase/firestore
  vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn().mockReturnValue(mockFirestore),
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
  }));
};

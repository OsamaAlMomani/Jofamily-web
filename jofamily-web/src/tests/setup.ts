/**
 * Global Test Setup
 *
 * This file runs before all tests and sets up:
 * - Global test utilities and polyfills
 * - Firebase and Auth mocks
 * - Common test configuration
 */

import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { vi } from 'vitest';

/**
 * Mock Firebase Auth and related services
 * This prevents real Firebase calls during tests
 */
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn().mockReturnValue({}),
  getApps: vi.fn().mockReturnValue([]),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({}),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue({}),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
}));

/**
 * Optional: Setup MSW (Mock Service Worker) for API testing
 * Uncomment if you add HTTP API calls to your app
 */
// export const server = setupServer();
//
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

/**
 * Global test configuration
 */
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };

/**
 * Suppress specific console warnings in tests
 * Uncomment if needed to reduce noise
 */
// const originalError = console.error;
// beforeAll(() => {
//   console.error = (...args: any[]) => {
//     if (
//       typeof args[0] === 'string' &&
//       args[0].includes('Warning: ReactDOM.render')
//     ) {
//       return;
//     }
//     originalError.call(console, ...args);
//   };
// });
//
// afterAll(() => {
//   console.error = originalError;
// });

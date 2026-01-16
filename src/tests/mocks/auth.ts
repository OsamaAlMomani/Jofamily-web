/**
 * Auth Context Mocks for Testing
 * Provides mock implementations of auth services for testing
 */

import { vi } from 'vitest';
import { mockUserCredential, mockUser } from './firebase';
import type { AuthContextValue } from '../../core/auth';

/**
 * Create a mock auth context provider
 * Returns default implementations of all auth methods
 */
export const createMockAuthContext = (
  overrides?: Partial<AuthContextValue>
): AuthContextValue => ({
  user: mockUser,
  loading: false,
  loginWithEmail: vi
    .fn()
    .mockResolvedValue(mockUserCredential),
  signupWithEmail: vi
    .fn()
    .mockResolvedValue(mockUserCredential),
  loginWithGoogle: vi
    .fn()
    .mockResolvedValue(mockUserCredential),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

/**
 * Mock implementations for different auth scenarios
 */
export const authMockScenarios = {
  /**
   * User successfully logged in
   */
  authenticated: (): AuthContextValue =>
    createMockAuthContext({
      user: mockUser,
      loading: false,
    }),

  /**
   * User not logged in
   */
  unauthenticated: (): AuthContextValue =>
    createMockAuthContext({
      user: null,
      loading: false,
    }),

  /**
   * Auth is loading
   */
  loading: (): AuthContextValue =>
    createMockAuthContext({
      user: null,
      loading: true,
    }),

  /**
   * Login fails with error
   */
  loginError: (): AuthContextValue =>
    createMockAuthContext({
      loginWithEmail: vi
        .fn()
        .mockRejectedValue(
          new Error('Invalid email or password')
        ),
    }),

  /**
   * Signup fails with error
   */
  signupError: (): AuthContextValue =>
    createMockAuthContext({
      signupWithEmail: vi
        .fn()
        .mockRejectedValue(
          new Error('Email already in use')
        ),
    }),
};

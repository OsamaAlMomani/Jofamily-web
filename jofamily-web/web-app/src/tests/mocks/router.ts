/**
 * React Router Mocks for Testing
 * Provides mock implementations of React Router for testing
 */

import { vi } from 'vitest';

/**
 * Mock useNavigate hook
 * Returns a mock function that tracks navigation calls
 */
export const createMockNavigate = () => vi.fn();

/**
 * Mock useLocation hook
 */
export const createMockLocation = () => ({
  pathname: '/',
  search: '',
  hash: '',
  state: undefined,
  key: 'default',
});

/**
 * Mock useParams hook
 */
export const createMockUseParams = (params: Record<string, string> = {}) =>
  params;

/**
 * Setup React Router mocks for tests
 */
export const setupRouterMocks = () => {
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => createMockNavigate(),
      useLocation: () => createMockLocation(),
      useParams: () => createMockUseParams(),
    };
  });
};

/**
 * Common router mock scenarios for testing
 */
export const routerMockScenarios = {
  /**
   * Mock router for home page
   */
  homePage: () => ({
    pathname: '/',
    search: '',
    hash: '',
  }),

  /**
   * Mock router for login page
   */
  loginPage: () => ({
    pathname: '/login',
    search: '',
    hash: '',
  }),

  /**
   * Mock router for protected page
   */
  protectedPage: () => ({
    pathname: '/profile',
    search: '',
    hash: '',
  }),
};

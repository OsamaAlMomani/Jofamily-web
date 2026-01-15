/**
 * Test Utilities - Render with Providers
 * 
 * Custom render functions that wrap components with required providers
 * (BrowserRouter, AuthContext) for realistic testing environments
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import { createMockAuthContext } from './mocks/auth';

/**
 * Custom render function that automatically wraps components with:
 * - BrowserRouter (for React Router hooks)
 * - AuthProvider (for auth context)
 *
 * @example
 * ```tsx
 * import { render, screen } from './test-utils'
 *
 * test('login button renders', () => {
 *   render(<Login />)
 *   expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
 * })
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    authContextValue = createMockAuthContext(),
    ...renderOptions
  }: RenderOptions & { authContextValue?: AuthContextValue } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={authContextValue}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from testing-library/react for convenience
 * This allows you to import from 'test-utils' instead of two places
 *
 * @example
 * ```tsx
 * import { render, screen, waitFor } from './test-utils'
 * ```
 */
export * from '@testing-library/react';

// Override render with our custom render function
export { renderWithProviders as render };

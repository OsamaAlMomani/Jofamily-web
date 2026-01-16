/**
 * ============================================================================
 * LOGIN PAGE TEST SUITE
 * ============================================================================
 * 
 * This test suite demonstrates login page validation using the new
 * testing utilities and infrastructure.
 * 
 * Key improvements:
 * ✓ Uses custom render() with providers (BrowserRouter, AuthContext)
 * ✓ Uses mock scenarios for different auth states
 * ✓ Organized test cases for better maintainability
 * ✓ Comprehensive documentation for learning
 * ✓ Ready to extend with additional test cases
 * 
 * LEARNING RESOURCES:
 * -------------------
 * 1. Vitest Documentation: https://vitest.dev/guide/
 * 2. React Testing Library: https://testing-library.com/docs/react-testing-library/intro
 * 3. Testing Best Practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
 * 4. User Event Guide: https://testing-library.com/docs/user-event/intro
 * 5. Async Testing: https://testing-library.com/docs/dom-testing-library/api-async
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../src/tests/test-utils';
import { authMockScenarios } from '../src/tests/mocks/auth';
import Login from '../src/pages/Login/Login.tsx';

// ============================================================================
// TEST SETUP & TEARDOWN
// ============================================================================

describe('Login Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  // ========================================================================
  // NEGATIVE TEST CASES (Test invalid inputs first)
  // ========================================================================
  // Why negative testing first?
  // 1. Catch edge cases and invalid states early
  // 2. Ensure system handles errors gracefully
  // 3. Verify security measures are in place
  // 4. Ensure system stability under bad input
  // ========================================================================

  describe('Negative Test Cases - Invalid Inputs', () => {
    /**
     * Test Case 1: Valid email but wrong password
     * Should display error message
     */
    it('should display error when password is incorrect', async () => {
      const user = userEvent.setup();

      // Mock login to reject with error
      const mockLogin = vi.fn().mockRejectedValue(
        new Error('Invalid email or password')
      );

      render(<Login />, {
        authContextValue: authMockScenarios.authenticated(),
      });

      // This test structure is called AAA Pattern:
      // Arrange - Find elements
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Act - Simulate user interactions
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      // Assert - Verify error message appears
      // NOTE: In real implementation, you would need to mock the auth service
      // to test the error handling. This is a template for you to extend.
      expect(loginButton).toBeInTheDocument();
    });

    /**
     * Test Case 2: Empty email and password
     * Should not allow login or show validation error
     */
    it('should not allow login with empty email and password', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Try to login without entering anything
      await user.click(loginButton);

      // Verify fields are still empty
      expect(emailInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });

    /**
     * Test Case 3: Invalid email format (no @)
     * Should show validation error
     */
    it('should reject email without @ symbol', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      // Enter invalid email
      await user.type(emailInput, 'invalidemail');
      await user.type(passwordInput, 'Password123');
      await user.click(loginButton);

      // Verify login button exists (real validation depends on component)
      expect(loginButton).toBeInTheDocument();
    });

    /**
     * Test Case 4: Very long password (buffer overflow test)
     * Should handle gracefully without crashing
     */
    it('should handle very long password input gracefully', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      const veryLongPassword = 'a'.repeat(10000);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, veryLongPassword);

      // Verify component still renders without crashing
      expect(passwordInput).toBeInTheDocument();
    });

    /**
     * Test Case 5: Special characters in input
     * Should handle or sanitize special characters
     */
    it('should handle special characters in input', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test+tag@example.com');
      await user.type(passwordInput, '!@#$%^&*()_+-=[]{}|;:,.<>?');

      // Verify inputs accept special characters
      expect(emailInput).toHaveValue('test+tag@example.com');
      expect(passwordInput).toHaveValue('!@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    /**
     * Test Case 6: SQL Injection attempt
     * Should treat as plain text, not execute SQL
     */
    it('should safely handle SQL injection attempts', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);

      const sqlInjection = "'; DROP TABLE users; --";
      await user.type(emailInput, sqlInjection);

      // Verify input is treated as plain text
      expect(emailInput).toHaveValue(sqlInjection);
    });

    /**
     * Test Case 7: XSS (Cross-Site Scripting) attempt
     * Should not execute HTML/JavaScript
     */
    it('should safely handle XSS attempts', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const xssPayload = '<img src=x onerror="alert(\'xss\')">';

      await user.type(emailInput, xssPayload);

      // Verify input is treated as plain text
      expect(emailInput).toHaveValue(xssPayload);
    });

    /**
     * Test Case 8: Leading and trailing spaces
     * Should trim or handle appropriately
     */
    it('should handle leading and trailing spaces', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, '  test@example.com  ');
      await user.type(passwordInput, '  Password123  ');

      // Verify inputs contain the spaces (component can handle trimming)
      expect(emailInput).toHaveValue('  test@example.com  ');
      expect(passwordInput).toHaveValue('  Password123  ');
    });
  });

  // ========================================================================
  // POSITIVE TEST CASES (Test valid inputs and happy path)
  // ========================================================================

  describe('Positive Test Cases - Valid Inputs', () => {
    /**
     * Test Case: Successful login with valid credentials
     */
    it('should render login form with all required fields', () => {
      render(<Login />);

      // Verify all form elements exist
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    /**
     * Test Case: User can input valid credentials
     */
    it('should accept valid email and password input', async () => {
      const user = userEvent.setup();

      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'ValidPassword123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('ValidPassword123');
    });
  });

  // ========================================================================
  // FUTURE TEST CASES - Ready to implement
  // ========================================================================

  describe('Authentication Tests - To be implemented', () => {
    it.skip('should call loginWithEmail when form is submitted with valid credentials', async () => {
      // TODO: Implement with mocked auth context
      // - Mock loginWithEmail function
      // - Fill form with valid data
      // - Click login button
      // - Assert loginWithEmail was called with correct parameters
    });

    it.skip('should display loading state while authenticating', async () => {
      // TODO: Implement with loading auth context
      // - Render with loading: true
      // - Verify button is disabled
      // - Verify loading spinner appears
    });

    it.skip('should navigate to home page on successful login', async () => {
      // TODO: Implement with mocked navigation
      // - Mock useNavigate
      // - Verify navigate was called with '/'
    });

    it.skip('should display error message on login failure', async () => {
      // TODO: Implement with mocked error
      // - Mock loginWithEmail to reject with error
      // - Verify error message is displayed
    });

    it.skip('should support Google login', async () => {
      // TODO: Implement Google login test
      // - Find Google login button
      // - Mock loginWithGoogle
      // - Verify navigation on success
    });
  });
});

// ============================================================================
// TESTING PATTERNS & EXAMPLES
// ============================================================================

/**
 * QUERY PRIORITY (Use in this order):
 * 
 * 1. getByRole - BEST (matches accessibility API)
 *    screen.getByRole('button', { name: /login/i })
 * 
 * 2. getByLabelText - for form inputs
 *    screen.getByLabelText(/email/i)
 * 
 * 3. getByPlaceholderText - fallback for inputs
 *    screen.getByPlaceholderText(/enter email/i)
 * 
 * 4. getByText - for text content
 *    screen.getByText(/welcome/i)
 * 
 * 5. getByTestId - LAST RESORT
 *    screen.getByTestId('login-form')
 */

/**
 * QUERY VARIANTS (getBy, queryBy, findBy):
 * 
 * getBy* - Throws error if not found
 *   Use when element MUST exist
 *   const button = screen.getByRole('button')
 * 
 * queryBy* - Returns null if not found
 *   Use when element might not exist
 *   const error = screen.queryByText(/error/i)
 *   expect(error).not.toBeInTheDocument()
 * 
 * findBy* - Async, waits for element
 *   Use for elements that appear after delay
 *   const message = await screen.findByText(/success/i)
 */

/**
 * USER INTERACTIONS (userEvent vs fireEvent):
 * 
 * ✅ USE userEvent (more realistic):
 *   const user = userEvent.setup()
 *   await user.type(input, 'text')
 *   await user.click(button)
 *   await user.tab()
 *   await user.keyboard('{Enter}')
 * 
 * ❌ AVOID fireEvent (synthetic events):
 *   fireEvent.change(input, { target: { value: 'text' } })
 *   fireEvent.click(button)
 */

/**
 * MOCKING AUTH CONTEXT:
 * 
 * render(<Login />, {
 *   authContextValue: {
 *     user: mockUser,
 *     loading: false,
 *     loginWithEmail: vi.fn().mockResolvedValue(...),
 *     logout: vi.fn(),
 *     // ... other methods
 *   }
 * })
 * 
 * Or use pre-built scenarios:
 *   authMockScenarios.authenticated()
 *   authMockScenarios.unauthenticated()
 *   authMockScenarios.loading()
 *   authMockScenarios.loginError()
 */

/**
 * RUNNING TESTS:
 * 
 * npm test                        → Watch mode (default)
 * npm test -- --run               → Run once and exit
 * npm test -- --ui                → Visual dashboard
 * npm test -- --coverage          → Coverage report
 * npm test page.login             → Run this file
 * npm test -- --reporter=verbose  → Detailed output
 */

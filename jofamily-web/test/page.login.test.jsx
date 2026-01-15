/**
 * ============================================================================
 * LOGIN PAGE TEST SUITE - TESTING GUIDE & DOCUMENTATION
 * ============================================================================
 * 
 * LEARNING RESOURCES:
 * -------------------
 * 1. Vitest Testing Framework: https://vitest.dev/guide/
 * 2. React Testing Library: https://testing-library.com/docs/react-testing-library/intro
 * 3. Testing Best Practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
 * 4. User Event vs FireEvent: https://testing-library.com/docs/user-event/intro
 * 5. Async Testing Guide: https://testing-library.com/docs/dom-testing-library/api-async
 * 
 * 
 * HOW TO WRITE TESTS:
 * -------------------
 * 
 * Step 1: Import Required Tools
 * ------------------------------
 * - test/it: Defines a test case
 * - describe: Groups related tests
 * - expect: Makes assertions
 * - render: Renders React component
 * - screen: Queries DOM elements
 * - userEvent: Simulates user interactions (RECOMMENDED over fireEvent)
 * - waitFor: Waits for async changes
 * 
 * Example:
 *   import { describe, it, expect, vi } from 'vitest';
 *   import { render, screen, waitFor } from '@testing-library/react';
 *   import userEvent from '@testing-library/user-event';
 * 
 * 
 * Step 2: Render Your Component
 * ------------------------------
 * Wrap with required providers (Router, Auth, etc.)
 * 
 * Example:
 *   render(
 *     <BrowserRouter>
 *       <Login />
 *     </BrowserRouter>
 *   );
 * 
 * 
 * Step 3: Query Elements (Use Accessibility Queries)
 * ---------------------------------------------------
 * Priority Order:
 *   1. getByRole (BEST - matches how users interact)
 *   2. getByLabelText (for form inputs)
 *   3. getByPlaceholderText
 *   4. getByText
 *   5. getByTestId (LAST RESORT)
 * 
 * Examples:
 *   const button = screen.getByRole('button', { name: /sign in/i });
 *   const emailInput = screen.getByLabelText(/email/i);
 *   const error = screen.getByText(/invalid password/i);
 * 
 * Query Variants:
 *   - getBy* → Throws error if not found (use for elements that MUST exist)
 *   - queryBy* → Returns null if not found (use for elements that might not exist)
 *   - findBy* → Async, waits for element (use for elements that appear after delay)
 * 
 * 
 * Step 4: Simulate User Interactions
 * -----------------------------------
 * Use userEvent (more realistic) instead of fireEvent
 * 
 * Examples:
 *   const user = userEvent.setup();
 *   await user.type(emailInput, 'test@example.com');
 *   await user.click(button);
 *   await user.clear(input);
 *   await user.keyboard('{Enter}');
 * 
 * 
 * Step 5: Make Assertions
 * ------------------------
 * Use jest-dom matchers for readable assertions
 * 
 * Examples:
 *   expect(button).toBeInTheDocument();
 *   expect(button).toBeDisabled();
 *   expect(input).toHaveValue('test@example.com');
 *   expect(element).toHaveTextContent(/error/i);
 *   expect(link).toHaveAttribute('href', '/login');
 * 
 * 
 * Step 6: Handle Async Behavior
 * ------------------------------
 * Use waitFor for async state changes
 * 
 * Examples:
 *   await waitFor(() => {
 *     expect(screen.getByText(/success/i)).toBeInTheDocument();
 *   });
 * 
 *   const errorMsg = await screen.findByText(/error/i);
 *   expect(errorMsg).toBeInTheDocument();
 * 
 * 
 * MOCKING GUIDE:
 * --------------
 * Mock authentication, API calls, and navigation
 * 
 * Example - Mock Auth Context:
 *   const mockLogin = vi.fn();
 *   vi.mock('../auth/AuthContext', () => ({
 *     useAuth: () => ({ loginWithEmail: mockLogin })
 *   }));
 * 
 *   // Simulate success
 *   mockLogin.mockResolvedValue(undefined);
 * 
 *   // Simulate error
 *   mockLogin.mockRejectedValue(new Error('Invalid password'));
 * 
 * Example - Mock Navigation:
 *   const mockNavigate = vi.fn();
 *   vi.mock('react-router-dom', async () => ({
 *     ...await vi.importActual('react-router-dom'),
 *     useNavigate: () => mockNavigate,
 *   }));
 * 
 * 
 * TEST STRUCTURE:
 * ---------------
 * describe('Feature Name', () => {
 *   beforeEach(() => {
 *     // Setup before each test
 *     vi.clearAllMocks();
 *   });
 * 
 *   it('should do something specific', async () => {
 *     // Arrange - setup test data
 *     const user = userEvent.setup();
 *     render(<Component />);
 * 
 *     // Act - perform user actions
 *     await user.type(input, 'test');
 *     await user.click(button);
 * 
 *     // Assert - verify results
 *     expect(mockFunction).toHaveBeenCalled();
 *   });
 * });
 * 
 * 
 * RUNNING TESTS:
 * --------------
 * npm test                    → Run all tests in watch mode
 * npm test -- --run           → Run once
 * npm test -- --ui            → Visual dashboard
 * npm test -- --coverage      → Coverage report
 * npm test page.login.test    → Run this file only
 * 
 * 
 * DEBUGGING TESTS:
 * ----------------
 * // See what's rendered
 * const { debug } = render(<Component />);
 * debug();
 * 
 * // Or debug specific element
 * debug(screen.getByRole('button'));
 * 
 * // Check available queries
 * screen.logTestingPlaygroundURL();
 * 
 * 
 * COMMON ISSUES & FIXES:
 * ----------------------
 * 
 * Issue: "Unable to find element"
 * Fix: Use screen.debug() to see what's rendered
 *      Check if element is wrapped in provider
 *      Use correct query (getByRole vs getByText)
 * 
 * Issue: "Element type is invalid" or "undefined"
 * Fix: Check import statement - use default import or named import correctly
 *      ✅ CORRECT: import Login from '../pages/Login/Login'
 *      ❌ WRONG: import { Login } from '../pages/Login/Login'
 * 
 * Issue: "Not wrapped in act(...)"
 * Fix: Use userEvent instead of fireEvent
 *      Use await with async actions
 *      Use waitFor for async state changes
 * 
 * Issue: Test timeout
 * Fix: Add timeout option: it('test', async () => {...}, { timeout: 10000 })
 *      Make sure all promises are awaited
 * 
 * Issue: Mock not working
 * Fix: Ensure vi.mock() is at top level (not inside test)
 *      Clear mocks between tests: vi.clearAllMocks()
 * 
 * ============================================================================
 */

/**
 * LOGIN PAGE TEST - Basic Test
 * 
 * This test demonstrates the usage of the new test infrastructure.
 * Before reading this, check TESTING_GUIDE.md for comprehensive documentation.
 */

import { describe, test, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
// Use custom render (automatically includes Router & AuthContext)
import { render, screen } from '../src/tests/test-utils';
import Login from '../src/pages/Login/Login.tsx';

describe('Login Page - Original Test Suite', () => {
  /**
   * NEGATIVE TEST CASES
   * 
   * Why test invalid inputs first?
   * 1. Detect bugs early before users encounter them
   * 2. Ensure system handles errors gracefully
   * 3. Verify security measures are in place
   * 4. Ensure system stability under bad input
   */

  test('should render login form elements', async () => {
    // Using new render() function - automatically wrapped with providers!
    render(<Login />);

    // Verify form elements exist
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('should accept user input', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Use userEvent instead of fireEvent for more realistic simulation
    await user.type(emailInput, 'admin@example.com');
    await user.type(passwordInput, 'WrongPassword123');

    // Verify inputs have the values
    expect(emailInput).toHaveValue('admin@example.com');
    expect(passwordInput).toHaveValue('WrongPassword123');
  });

  /**
   * FUTURE TEST CASES - To be implemented
   * 
   * To-do list (following best practices):
   *   1. Login with correct credentials → navigate to home
   *   2. Login with wrong password → show error message
   *   3. Login with non-existent email → show error
   *   4. Login with empty inputs → prevent submission
   *   5. Login with invalid email format → show validation error
   *   6. Login with special characters → handle safely
   *   7. Login with SQL injection → treat as plain text
   *   8. Login with XSS payload → sanitize input
   *   9. Login with very long password → handle gracefully
   *   10. Login with leading/trailing spaces → trim appropriately
   * 
   * See test/page.login.test.new.jsx for full examples!
   */
});
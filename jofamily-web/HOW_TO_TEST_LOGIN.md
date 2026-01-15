# 📚 Complete Testing Guide for Login Validation

## Table of Contents
1. [Learning Resources](#learning-resources)
2. [Testing Fundamentals](#testing-fundamentals)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Test Case Examples](#test-case-examples)
5. [Mocking Guide](#mocking-guide)
6. [Best Practices](#best-practices)
7. [Common Errors & Solutions](#common-errors--solutions)
8. [Video Tutorials](#video-tutorials)

---

## 📖 Learning Resources

### Official Documentation
- **Vitest** (Test Framework): https://vitest.dev/guide/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro
- **Testing Library Queries**: https://testing-library.com/docs/queries/about
- **User Event API**: https://testing-library.com/docs/user-event/intro
- **Jest-DOM Matchers**: https://github.com/testing-library/jest-dom

### Essential Reading
- **Common Testing Mistakes**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Testing Best Practices**: https://kentcdodds.com/blog/write-tests
- **Which Query Should I Use?**: https://testing-library.com/docs/queries/about#priority
- **Async Testing Guide**: https://testing-library.com/docs/dom-testing-library/api-async

### Interactive Tutorials
- **Testing Playground**: https://testing-playground.com/ (Practice queries)
- **Jest Cheat Sheet**: https://github.com/sapegin/jest-cheat-sheet
- **Vitest UI**: Run `npm test -- --ui` for visual dashboard

---

## 🎯 Testing Fundamentals

### What is Unit Testing?
Testing individual components in isolation to ensure they work correctly.

**Benefits:**
- ✅ Catch bugs early
- ✅ Document expected behavior
- ✅ Enable safe refactoring
- ✅ Improve code quality
- ✅ Reduce manual testing time

### Test Anatomy (AAA Pattern)

```javascript
test('user can login with valid credentials', async () => {
  // 1. ARRANGE - Set up test data and render component
  const user = userEvent.setup();
  render(<Login />);
  
  // 2. ACT - Perform user actions
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'Password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  // 3. ASSERT - Verify expected outcome
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

---

## 📝 Step-by-Step Guide

### Step 1: Import Testing Tools

```javascript
// Testing framework
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// React Testing Library
import { render, screen, waitFor } from '@testing-library/react';

// User interactions
import userEvent from '@testing-library/user-event';

// DOM matchers
import '@testing-library/jest-dom';

// Your component
import Login from '../pages/Login/Login';

// Providers (Router, Auth, etc.)
import { BrowserRouter } from 'react-router-dom';
```

**What each tool does:**
- `test` / `it`: Define a test case
- `describe`: Group related tests
- `expect`: Make assertions
- `vi`: Create mocks and spies
- `render`: Render React component
- `screen`: Query DOM elements
- `userEvent`: Simulate realistic user interactions
- `waitFor`: Wait for async changes

---

### Step 2: Set Up Test Environment

```javascript
// Mock authentication
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    loginWithEmail: mockLogin,
    loginWithGoogle: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render with providers
function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

// Clean up between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup(); // Clean up DOM
});
```

---

### Step 3: Query Elements (The Right Way)

**Priority Order** (Use accessibility-first queries):

1. **`getByRole`** (BEST - How users interact)
```javascript
screen.getByRole('button', { name: /sign in/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { name: /welcome/i })
```

2. **`getByLabelText`** (For form inputs)
```javascript
screen.getByLabelText(/email/i)
screen.getByLabelText(/password/i)
```

3. **`getByPlaceholderText`** (When no label)
```javascript
screen.getByPlaceholderText(/enter email/i)
```

4. **`getByText`** (For static content)
```javascript
screen.getByText(/forgot password/i)
```

5. **`getByTestId`** (LAST RESORT - Avoid if possible)
```javascript
screen.getByTestId('login-form')
```

**Query Variants:**

| Query Type | Returns | Use When |
|------------|---------|----------|
| `getBy*` | Element or throws | Element MUST exist |
| `queryBy*` | Element or null | Element might not exist |
| `findBy*` | Promise<Element> | Element appears after delay |

---

### Step 4: Simulate User Interactions

**Use `userEvent` (NOT `fireEvent`)**

Why? userEvent simulates realistic user behavior:
- Types character by character
- Fires all events in correct order
- Respects element state (disabled, readonly)
- Handles focus, blur, keyboard events

```javascript
const user = userEvent.setup(); // Always setup first

// Type text
await user.type(emailInput, 'test@example.com');

// Click button
await user.click(submitButton);

// Clear input
await user.clear(emailInput);

// Press keys
await user.keyboard('{Enter}');
await user.keyboard('{Control>}a{/Control}'); // Ctrl+A

// Upload file
await user.upload(fileInput, file);

// Select option
await user.selectOptions(select, 'option1');
```

---

### Step 5: Make Assertions

**Use `jest-dom` matchers for readable assertions:**

```javascript
// Visibility
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).not.toBeInTheDocument();

// State
expect(button).toBeDisabled();
expect(button).toBeEnabled();
expect(checkbox).toBeChecked();

// Content
expect(element).toHaveTextContent(/error/i);
expect(element).toHaveValue('test@example.com');

// Attributes
expect(link).toHaveAttribute('href', '/login');
expect(input).toHaveAttribute('type', 'password');

// CSS
expect(element).toHaveClass('error');
expect(element).toHaveStyle({ color: 'red' });
```

---

### Step 6: Handle Async Behavior

**Wait for changes with `waitFor` or `findBy*`:**

```javascript
// Method 1: waitFor
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Method 2: findBy* (combines getBy + waitFor)
const errorMsg = await screen.findByText(/error/i);
expect(errorMsg).toBeInTheDocument();

// Custom timeout
await waitFor(() => {
  expect(mockLogin).toHaveBeenCalled();
}, { timeout: 5000 });
```

---

## 💡 Test Case Examples

### Example 1: Positive Test (Valid Login)

```javascript
it('should login successfully with valid credentials', async () => {
  const user = userEvent.setup();
  mockLogin.mockResolvedValue(undefined); // Simulate success
  
  renderLogin();
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /sign in/i });
  
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'Password123');
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
```

### Example 2: Negative Test (Wrong Password)

```javascript
it('should show error with wrong password', async () => {
  const user = userEvent.setup();
  mockLogin.mockRejectedValue(new Error('Invalid password')); // Simulate error
  
  renderLogin();
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'WrongPassword');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  const errorMsg = await screen.findByText(/invalid password/i);
  expect(errorMsg).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
```

### Example 3: Security Test (SQL Injection)

```javascript
it('should handle SQL injection attempt safely', async () => {
  const user = userEvent.setup();
  mockLogin.mockRejectedValue(new Error('Invalid credentials'));
  
  renderLogin();
  
  const maliciousInput = "admin' OR '1'='1";
  await user.type(screen.getByLabelText(/email/i), maliciousInput);
  await user.type(screen.getByLabelText(/password/i), maliciousInput);
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  // Should treat as normal string, not execute SQL
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith(maliciousInput, maliciousInput);
  });
});
```

### Example 4: UI State Test

```javascript
it('should disable button while submitting', async () => {
  const user = userEvent.setup();
  mockLogin.mockImplementation(() => new Promise(r => setTimeout(r, 1000)));
  
  renderLogin();
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'Password123');
  
  const button = screen.getByRole('button', { name: /sign in/i });
  await user.click(button);
  
  expect(button).toBeDisabled(); // Should be disabled during submit
});
```

---

## 🎭 Mocking Guide

### Why Mock?
- ✅ Isolate component logic
- ✅ Avoid real API calls
- ✅ Test error scenarios
- ✅ Speed up tests
- ✅ No dependencies on external services

### Mock Authentication

```javascript
const mockLogin = vi.fn();

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    loginWithEmail: mockLogin,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    user: null,
  }),
}));

// In test - simulate success
mockLogin.mockResolvedValue(undefined);

// In test - simulate error
mockLogin.mockRejectedValue(new Error('Invalid password'));

// Verify it was called
expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123');
expect(mockLogin).toHaveBeenCalledTimes(1);
```

### Mock Navigation

```javascript
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...await vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// In test - verify navigation
expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
```

### Mock Firebase

```javascript
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { uid: '123', email: 'test@example.com' },
  }),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));
```

---

## ✅ Best Practices

### 1. Test User Behavior, Not Implementation

```javascript
// ❌ BAD - Tests implementation details
expect(component.state.email).toBe('test@example.com');

// ✅ GOOD - Tests user-facing behavior
expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
```

### 2. Use Accessible Queries

```javascript
// ❌ BAD - Hard to maintain
screen.getByTestId('submit-btn');

// ✅ GOOD - Matches how users interact
screen.getByRole('button', { name: /sign in/i });
```

### 3. Write Descriptive Test Names

```javascript
// ❌ BAD
it('test 1', () => { ... });

// ✅ GOOD
it('should show error message when password is wrong', () => { ... });
```

### 4. One Assertion Per Concept

```javascript
// ✅ GOOD - Clear what's being tested
it('should login successfully', () => { ... });
it('should navigate to dashboard after login', () => { ... });

// ❌ BAD - Too many concepts in one test
it('should login and navigate and show success message', () => { ... });
```

### 5. Clean Up Between Tests

```javascript
beforeEach(() => {
  vi.clearAllMocks(); // Reset mock call history
});

afterEach(() => {
  cleanup(); // Unmount React components
});
```

---

## 🐛 Common Errors & Solutions

### Error: "Unable to find element by role"

**Cause:** Element doesn't exist or query is wrong

**Solution:**
```javascript
// Debug what's rendered
const { debug } = render(<Login />);
debug();

// Or use Testing Playground
screen.logTestingPlaygroundURL();

// Check element exists
expect(screen.queryByRole('button')).toBeInTheDocument();
```

---

### Error: "Not wrapped in act(...)"

**Cause:** State updates not properly awaited

**Solution:**
```javascript
// ❌ BAD
fireEvent.click(button);

// ✅ GOOD
const user = userEvent.setup();
await user.click(button);

// For async state changes
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

---

### Error: "Test timed out after 5000ms"

**Cause:** Async operation not resolving

**Solution:**
```javascript
// Increase timeout
it('async test', async () => {
  // ... test code
}, { timeout: 10000 });

// Ensure all promises are awaited
await waitFor(() => { ... }, { timeout: 10000 });
```

---

### Error: "Mock function not called"

**Cause:** Mock not set up correctly

**Solution:**
```javascript
// Ensure mock is at top level, not inside test
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ loginWithEmail: vi.fn() }),
}));

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

### Error: "Element not found after async operation"

**Cause:** Not waiting for element to appear

**Solution:**
```javascript
// Use findBy* (async)
const element = await screen.findByText(/success/i);

// Or use waitFor
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

---

## 🎥 Video Tutorials

### Recommended YouTube Channels
1. **Kent C. Dodds** - Testing Library creator
   - https://www.youtube.com/kentcdodds

2. **Web Dev Simplified** - Beginner-friendly testing
   - https://www.youtube.com/c/WebDevSimplified

3. **Codevolution** - React Testing Tutorial Series
   - https://www.youtube.com/c/Codevolution

### Specific Video Recommendations

**Beginner:**
- "React Testing Library Tutorial" by Codevolution (Full Course)
- "Testing React Apps with Jest and Testing Library" by Academind

**Intermediate:**
- "Common Mistakes with React Testing Library" by Kent C. Dodds
- "How to Test Custom React Hooks" by Ben Awad

**Advanced:**
- "Advanced Testing Patterns" by Kent C. Dodds
- "Integration vs Unit Tests in React" by Harry Wolff

---

## 🚀 Running Your Tests

```bash
# Run all tests
npm test

# Run specific file
npm test page.login.test

# Watch mode (auto-rerun on changes)
npm test -- --watch

# Visual UI dashboard
npm test -- --ui

# Coverage report
npm test -- --coverage

# Verbose output (see all test names)
npm test -- --reporter=verbose

# Debug mode
npm test -- --inspect-brk
```

---

## 📊 Coverage Goals

Aim for these coverage targets:

- **Line Coverage:** 80%+
- **Branch Coverage:** 75%+
- **Function Coverage:** 85%+

**Priority areas for 90%+ coverage:**
- Authentication logic
- Form validation
- Security-related code
- Critical user paths

---

## 🔗 Quick Reference Links

**Cheat Sheets:**
- Vitest Matchers: https://vitest.dev/api/expect.html
- Jest-DOM Matchers: https://github.com/testing-library/jest-dom#custom-matchers
- Testing Library Queries: https://testing-library.com/docs/queries/about

**Tools:**
- Testing Playground: https://testing-playground.com/
- Regex Tester (for text queries): https://regex101.com/

**Community:**
- Stack Overflow - `[react-testing-library]` tag
- Discord - Testing Library Community

---

## 📖 Your Test File Structure Reference

Your current test file (`test/page.login.test.js`) has documentation for:
1. ✅ Import statements and what each tool does
2. ✅ How to render components with providers
3. ✅ Query selectors and priority order
4. ✅ User interaction examples
5. ✅ Assertion examples
6. ✅ Async handling patterns
7. ✅ Mocking authentication and navigation
8. ✅ Test structure (AAA pattern)
9. ✅ Debugging techniques
10. ✅ Common issues and fixes

**Refer to the documentation in your test file for inline examples!**

---

## 🎯 Next Steps

1. ✅ Read the documentation in `test/page.login.test.js`
2. 📺 Watch "React Testing Library Tutorial" by Codevolution
3. 🧪 Run your existing test: `npm test page.login.test`
4. 🔍 Use `screen.debug()` to see what's rendered
5. ✏️ Write your first test case from the to-do list
6. 📊 Check coverage: `npm test -- --coverage`

**Remember:** Start with simple tests and gradually add more complex scenarios!

---

*Happy Testing! 🚀*

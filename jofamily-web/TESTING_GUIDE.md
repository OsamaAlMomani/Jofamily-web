# Testing Guide - JoFamily Web

## Overview

This guide explains the new testing infrastructure and how to use it efficiently.

### What's Included

✅ **Pre-configured test utilities** - No need to wrap components manually  
✅ **Mock implementations** - Firebase, Auth, and Router all mocked  
✅ **Test scenarios** - Pre-built auth states for common testing situations  
✅ **Comprehensive examples** - Real test cases to learn from  
✅ **Best practices** - Industry-standard patterns and conventions  

## Quick Start

### 1. Import Test Utilities

```typescript
// ✅ Use custom render (has providers built-in)
import { render, screen } from '../src/tests/test-utils';
import userEvent from '@testing-library/user-event';
import { authMockScenarios } from '../src/tests/mocks/auth';
```

### 2. Write Your First Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../src/tests/test-utils';
import Login from '../pages/Login/Login';

describe('Login Page', () => {
  it('should render login form', () => {
    // No need to wrap with BrowserRouter or AuthContext!
    // Our custom render() handles it automatically
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});
```

### 3. Run Tests

```bash
npm test                    # Watch mode
npm test -- --run           # Run once
npm test -- --ui            # Visual dashboard
npm test -- --coverage      # Coverage report
```

## Test Utilities API

### `render(component, options?)`

Custom render function that wraps components with required providers.

#### Usage

```typescript
import { render } from '../src/tests/test-utils';

// Default: Renders with authenticated user
render(<Login />);

// With unauthenticated user
render(<Login />, {
  authContextValue: authMockScenarios.unauthenticated()
});

// With loading state
render(<Login />, {
  authContextValue: authMockScenarios.loading()
});

// With error
render(<Login />, {
  authContextValue: authMockScenarios.loginError()
});

// Custom auth context
render(<Login />, {
  authContextValue: {
    user: mockUser,
    loading: false,
    loginWithEmail: vi.fn().mockResolvedValue(...),
    signupWithEmail: vi.fn(),
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  }
});
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `authContextValue` | `AuthContextValue` | `authenticated()` | Auth context state |
| `...renderOptions` | `RenderOptions` | - | Standard RTL render options |

#### Returns

Same as `@testing-library/react.render()`

### Auth Mock Scenarios

Pre-built auth contexts for common situations:

```typescript
import { authMockScenarios } from '../src/tests/mocks/auth';

// Logged in user
authMockScenarios.authenticated();

// Not logged in
authMockScenarios.unauthenticated();

// Still loading
authMockScenarios.loading();

// Login failed
authMockScenarios.loginError();

// Signup failed
authMockScenarios.signupError();
```

## Mock Implementations

### Firebase Mocks

Located in `src/tests/mocks/firebase.ts`

```typescript
import { mockUser, mockUserCredential } from '../src/tests/mocks/firebase';

// Use in your tests
expect(mockUser.uid).toBe('test-user-123');
expect(mockUserCredential.user).toBe(mockUser);
```

### Auth Context Mocks

Located in `src/tests/mocks/auth.ts`

```typescript
import { createMockAuthContext, authMockScenarios } from '../src/tests/mocks/auth';

// Create custom mock
const customAuth = createMockAuthContext({
  loginWithEmail: vi.fn().mockRejectedValue(
    new Error('Network error')
  )
});

render(<Component />, { authContextValue: customAuth });
```

### Router Mocks

Located in `src/tests/mocks/router.ts`

```typescript
import { createMockNavigate, routerMockScenarios } from '../src/tests/mocks/router';

// Use in component tests
const mockNavigate = createMockNavigate();
```

## Example: Testing Login Component

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../src/tests/test-utils';
import { authMockScenarios } from '../src/tests/mocks/auth';
import Login from '../pages/Login/Login';

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<Login />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should handle user input', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should show error on login failure', async () => {
    const user = userEvent.setup();
    
    render(<Login />, {
      authContextValue: authMockScenarios.loginError()
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const button = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(button);

    // Component should display error
    await waitFor(() => {
      expect(screen.getByText(/invalid|error/i)).toBeInTheDocument();
    });
  });
});
```

## Testing Patterns

### Pattern 1: Query Elements Correctly

```typescript
// ✅ BEST: Use role queries
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })

// ✅ GOOD: Use label text for inputs
screen.getByLabelText(/email/i)

// ⚠️ ACCEPTABLE: Use placeholder
screen.getByPlaceholderText(/enter email/i)

// ⚠️ LAST RESORT: Use test ID
screen.getByTestId('submit-button')
```

### Pattern 2: User Interactions

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Type text
await user.type(emailInput, 'test@example.com');

// Click button
await user.click(submitButton);

// Clear input
await user.clear(input);

// Keyboard events
await user.keyboard('{Enter}');
await user.tab();
```

### Pattern 3: Async Operations

```typescript
import { waitFor } from '../src/tests/test-utils';

// Wait for element to appear
const successMessage = await screen.findByText(/success/i);

// Or use waitFor for multiple assertions
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
  expect(mockNavigate).toHaveBeenCalledWith('/home');
});

// With timeout
await waitFor(() => {
  expect(data).toBeDefined();
}, { timeout: 5000 });
```

### Pattern 4: Mocking Functions

```typescript
import { vi } from 'vitest';

// Create mock
const mockLogin = vi.fn();

// Mock resolved value
mockLogin.mockResolvedValue({ user: mockUser });

// Mock rejected value
mockLogin.mockRejectedValue(new Error('Invalid password'));

// Check calls
expect(mockLogin).toHaveBeenCalled();
expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
expect(mockLogin).toHaveBeenCalledTimes(1);
```

## Debugging Tests

### Print Rendered Output

```typescript
const { debug } = render(<Component />);
debug(); // Print entire component

debug(screen.getByRole('button')); // Print specific element
```

### Generate Testing Playground

```typescript
screen.logTestingPlaygroundURL();
// Click the URL to get an interactive testing sandbox
```

### Check Available Queries

```typescript
// Use this to explore what's available in the DOM
screen.debug();

// Then use appropriate query
screen.getByRole('button', { name: /click me/i });
```

## Common Issues & Solutions

### Issue: "useNavigate() may be used only in context of <Router>"

❌ **Problem**: Not using custom render

```typescript
// ❌ WRONG
render(<Login />);
```

✅ **Solution**: Use custom render from test-utils

```typescript
// ✅ CORRECT
import { render } from '../src/tests/test-utils';
render(<Login />);
```

### Issue: "useAuth must be used within <AuthProvider>"

❌ **Problem**: Auth context not provided

```typescript
// ❌ WRONG - no auth context
render(<LoginForm />);
```

✅ **Solution**: Use authMockScenarios

```typescript
// ✅ CORRECT
render(<LoginForm />, {
  authContextValue: authMockScenarios.authenticated()
});
```

### Issue: Test timeout

❌ **Problem**: Async operations not awaited

```typescript
// ❌ WRONG
user.click(button);
expect(screen.getByText(/success/i)).toBeInTheDocument();
```

✅ **Solution**: Use await

```typescript
// ✅ CORRECT
await user.click(button);
const successMsg = await screen.findByText(/success/i);
expect(successMsg).toBeInTheDocument();
```

### Issue: "Cannot find element"

❌ **Problem**: Using wrong query selector

```typescript
// ❌ WRONG - might not find the element
screen.getByText('Submit');
```

✅ **Solution**: Use more specific query with regex

```typescript
// ✅ CORRECT - case-insensitive, partial match
screen.getByRole('button', { name: /submit/i });
```

## Performance Tips

### 1. Run Single Test File

```bash
npm test -- page.login.test.jsx
```

### 2. Run Tests Matching Pattern

```bash
npm test -- -t "login"
```

### 3. Use Watch Mode Efficiently

```bash
npm test
# Then press:
# a - run all tests
# f - run failed tests only
# p - filter by filename
# t - filter by test name
```

### 4. Coverage Report

```bash
npm test -- --coverage
# Shows which lines aren't tested
```

## Advanced Topics

### Custom Mock Factories

```typescript
// Create reusable mock setup
export const createMockAuthForTest = (error?: Error) => {
  return {
    ...authMockScenarios.authenticated(),
    loginWithEmail: vi.fn().mockImplementation(async () => {
      if (error) throw error;
      return mockUserCredential;
    })
  };
};

// Use in tests
render(<Login />, {
  authContextValue: createMockAuthForTest(new Error('Invalid'))
});
```

### Testing Error Boundaries

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('Error Boundary', () => {
  // Suppress error output in tests
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

  it('should catch errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={<div>Error caught</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/error caught/i)).toBeInTheDocument();
    spy.mockRestore();
  });
});
```

## Resources

- **Vitest Docs**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **Example Tests**: See `test/page.login.test.new.jsx`

## Next Steps

1. Look at `test/page.login.test.new.jsx` for full example
2. Read `DEVELOPMENT_GUIDE.md` for project structure
3. Start writing tests for your features
4. Use `npm test -- --ui` to visualize test progress

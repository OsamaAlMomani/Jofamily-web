# Admin Portal System Documentation

## Overview
The Admin Portal is a separate authentication system with hardcoded static email verification. It provides administrative access to all ERP modules (Money, Studies, Work, Admin) in a unified dashboard.

## Features

### Static Email Authentication
- **No external database required** - Email verification happens in code
- **Admin Email**: `momani.322.44157@gmail.com` (hardcoded in AdminAuthContext.tsx)
- **Session storage**: Uses localStorage for persistence
- **Auto-login**: Sessions survive page refreshes

### Unified Admin Dashboard
- Access all 4 ERP modules from one interface
- Tab-based navigation between modules
- Admin logout functionality
- Session display showing admin email

### Routes
- `/admin/login` - Admin login page with static email verification
- `/admin/dashboard` - Unified admin dashboard (protected)

## Architecture

### File Structure
```
src/admin/
├── context/
│   └── AdminAuthContext.tsx      # Static auth provider with hardcoded email
├── pages/
│   ├── AdminLogin.tsx             # Login form component
│   ├── AdminLogin.css             # Glassmorphism styles for login
│   ├── AdminDashboard.tsx          # Main dashboard with all ERP modules
│   ├── AdminDashboard.css          # Dashboard styles
│   └── AdminProtectedRoute.tsx      # Route protection component
└── index.ts                        # Barrel exports
```

### Components

#### AdminAuthContext.tsx
Provides admin authentication context with:
- `ADMIN_EMAIL` constant: `'momani.322.44157@gmail.com'`
- `AdminAuthProvider`: Wraps app to provide context
- `useAdminAuth()`: Hook to access auth state
- `adminLogin(email, password)`: Static verification function
- `adminLogout()`: Logout function
- localStorage persistence for sessions

#### AdminLogin.tsx
Login page featuring:
- Email input field
- Password input field
- Form validation
- Error message display
- Loading state during login
- Redirect to dashboard on success

#### AdminDashboard.tsx
Main admin interface featuring:
- Tab navigation (Money, Studies, Work, Admin)
- All 4 ERP modules accessible
- Session display
- Logout button
- Responsive design

#### AdminProtectedRoute.tsx
Route guard that:
- Checks admin authentication status
- Redirects to login if not authenticated
- Protects `/admin/dashboard` route

## Usage

### 1. Logging In
Navigate to `/admin/login` and enter:
- **Email**: `momani.322.44157@gmail.com`
- **Password**: Any non-empty string (no specific validation)

### 2. Accessing Admin Dashboard
After successful login, you'll be redirected to `/admin/dashboard` with access to:
- **Money Module**: Financial transactions and analytics
- **Studies Module**: Academic tasks and progress
- **Work Module**: Shifts and work history
- **Admin Module**: Documents and administrative data

### 3. Session Management
- Sessions are saved to localStorage
- Sessions persist across page refreshes
- Clicking logout clears session and returns to login page

## Styling

Currently using glassmorphism theme with:
- Gradient backgrounds
- Backdrop blur effects
- Semi-transparent cards
- Smooth transitions

**Ready for styling customization**: All styles are in `.css` files and can be replaced with your design system.

## Security Notes

⚠️ **Static Implementation**:
- Email is hardcoded in client-side code (visible in browser)
- Password is not encrypted or validated
- For production, consider:
  - Moving to proper backend authentication
  - Implementing OAuth/SSO
  - Using encrypted secrets management

## Integration Points

The admin system integrates with:
- **ERP Modules**: Imports Money, Studies, Work, Admin from `/src/erp/modules/`
- **App Router**: Integrated into main routing in `App.tsx`
- **React Context**: Uses React Context API for state management

## Future Enhancements

Potential additions:
- Admin settings/configuration page
- Advanced reporting for all modules
- User management (if multi-user support needed)
- Audit logs for admin actions
- Role-based access control

## Customization

### Change Admin Email
Edit `src/admin/context/AdminAuthContext.tsx`:
```typescript
const ADMIN_EMAIL = 'your-email@example.com';
```

### Modify Styles
Edit CSS files in `src/admin/pages/`:
- `AdminLogin.css` - Login page styling
- `AdminDashboard.css` - Dashboard styling

### Add More Tabs/Modules
Edit `src/admin/pages/AdminDashboard.tsx`:
1. Add new tab type to `TabType` union
2. Add button in navigation
3. Add case in `renderModuleContent()`

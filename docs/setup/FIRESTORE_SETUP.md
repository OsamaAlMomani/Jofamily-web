# Firebase Database Setup Guide

## Firestore Database Configuration

Your JoFamily app now uses Cloud Firestore to store finance data persistently.

### 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/jofamily-acc6c/firestore)
2. Click "Create Database" (if not already created)
3. Choose **Production Mode** for security
4. Select a location (e.g., `us-central1` or closest to your users)
5. Click "Enable"

### 2. Deploy Firestore Rules

The security rules are already configured in `firestore.rules` to allow admin-only access:

```bash
firebase deploy --only firestore:rules
```

This ensures only `momani.322.44157@gmail.com` can read/write finance data.

### 3. Data Structure

The app stores finance records in a `finance_records` collection with this structure:

```javascript
{
  month: "Jan 2026",           // String: Month and year
  category: "Revenue",          // String: Revenue, Expenses, Marketing, etc.
  expected: 50000,             // Number: Expected amount
  actual: 48500,               // Number: Actual amount
  notes: "Performance notes",  // String: Optional notes
  createdAt: Timestamp,        // Auto: Creation timestamp
  updatedAt: Timestamp         // Auto: Last update timestamp (if updated)
}
```

### 4. Auto-Seeding

The dashboard automatically seeds sample data on first load if the database is empty. No manual data entry needed!

### 5. Local Development with Emulator

Test Firestore locally without touching production data:

```bash
npm run emulate
```

This starts:
- Hosting on http://localhost:5000
- Functions on http://localhost:5001
- Firestore on http://localhost:8080

### 6. Deploy All Firebase Services

Deploy hosting, functions, and Firestore rules together:

```bash
npm run build
firebase deploy
```

Or deploy only Firestore:

```bash
firebase deploy --only firestore
```

### 7. View Data in Console

- **Firestore Console**: https://console.firebase.google.com/project/jofamily-acc6c/firestore/data
- Monitor reads/writes and browse collections

### 8. Security Notes

- Only the admin email (`momani.322.44157@gmail.com`) can access finance data
- All other users are denied by default
- Rules are enforced server-side (cannot be bypassed from client)

### Next Steps

1. Enable Firestore in Firebase Console
2. Deploy the rules: `firebase deploy --only firestore:rules`
3. Login as admin and visit `/dashboard`
4. Data will auto-seed and persist across sessions!

### Troubleshooting

**Error: "Missing or insufficient permissions"**
- Make sure you're logged in as `momani.322.44157@gmail.com`
- Verify Firestore rules are deployed

**Error: "Firestore is not enabled"**
- Go to Firebase Console and enable Firestore
- Choose Production mode and a location

**Empty dashboard after login**
- Check browser console for errors
- Verify Firebase env variables in `.env`
- Make sure Firestore rules allow admin access

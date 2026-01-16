# Firebase/Firestore Database Setup Guide

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created on [Firebase Console](https://console.firebase.google.com)
- Logged in with Firebase: `firebase login`

---

## Step 1: Initialize Firebase Project

```bash
# In your project root
firebase init
```

Select these options:
- **Firestore**: Yes
- **Storage**: Yes
- **Emulator**: No (for now)

---

## Step 2: Environment Variables (.env or .env.local)

Create a `.env.local` file in your project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Get these values from Firebase Console → Project Settings → Web App

---

## Step 3: Firestore Collections Schema

Create these collections in Firebase Console or via initialization script:

### 1. **users** Collection
```
Document ID: {userId} (auto from Firebase Auth)
Fields:
  - uid: string (same as doc ID)
  - displayName: string
  - email: string
  - photoURL: string (optional)
  - familyId: string
  - createdAt: timestamp
```

### 2. **familyChats** Collection
```
Document ID: {threadId} (auto-generated)
Fields:
  - name: string
  - description: string
  - members: array of strings (user UIDs)
  - createdBy: string (user UID)
  - createdAt: timestamp

Subcollection: messages/{messageId}
  - text: string
  - senderId: string
  - senderName: string
  - timestamp: timestamp
  - reactions: array of {emoji, userId, userName}
  - replyTo: {messageId, text, author} (optional)
  - attachments: array of {url, fileName, size, type}
```

### 3. **familyEvents** Collection
```
Document ID: {eventId} (auto-generated)
Fields:
  - title: string
  - description: string
  - start: timestamp
  - end: timestamp
  - location: string
  - attendees: array of strings (user UIDs)
  - color: string (hex color)
  - reminderMinutes: number
  - isRecurring: boolean
  - recurrenceRule: string
  - createdBy: string (user UID)
  - createdAt: timestamp
```

### 4. **familyTasks** Collection
```
Document ID: {taskId} (auto-generated)
Fields:
  - title: string
  - description: string
  - assignedTo: string (user UID)
  - assignedBy: string (user UID)
  - status: string (pending | in-progress | completed)
  - priority: string (low | medium | high)
  - points: number
  - dueDate: timestamp
  - completedAt: timestamp (optional)
  - createdAt: timestamp
```

### 5. **userStats** Collection
```
Document ID: {userId}
Fields:
  - userId: string (same as doc ID)
  - userName: string
  - totalPoints: number
  - completedTasks: number
  - badges: array of strings
```

### 6. **familyExpenses** Collection
```
Document ID: {expenseId} (auto-generated)
Fields:
  - description: string
  - amount: number
  - category: string (food | transport | entertainment | utilities | health | education | other)
  - paidBy: string (user UID)
  - paidByName: string
  - date: timestamp
  - createdAt: timestamp
```

### 7. **familyBudgets** Collection
```
Document ID: {budgetId} (auto-generated)
Fields:
  - name: string
  - category: string (food | transport | entertainment | utilities | health | education | other)
  - limit: number
  - period: string (weekly | monthly)
  - createdBy: string (user UID)
  - createdAt: timestamp
```

### 8. **familyAllowances** Collection
```
Document ID: {allowanceId} (auto-generated)
Fields:
  - userId: string (recipient)
  - userName: string
  - amount: number
  - frequency: string (weekly | monthly)
  - nextPayment: timestamp
  - createdAt: timestamp
```

### 9. **safetyCheckIns** Collection
```
Document ID: {checkInId} (auto-generated)
Fields:
  - userId: string
  - userName: string
  - status: string (safe | warning | emergency)
  - latitude: number
  - longitude: number
  - location: string (address)
  - timestamp: timestamp
  - notes: string (optional)
```

---

## Step 4: Firebase Storage Rules

Storage buckets for file uploads:
- Path: `/chat-files/{userId}/{timestamp}-{filename}`
- Path: `/profile-photos/{userId}/{filename}`
- Path: `/receipts/{userId}/{timestamp}-{filename}`

---

## Step 5: Firestore Security Rules

Create `firestore.rules` file:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
    }
    
    // Chat messages
    match /familyChats/{chatId} {
      allow read, write: if request.auth.uid != null && 
        request.auth.uid in resource.data.members;
      
      match /messages/{messageId} {
        allow read: if request.auth.uid != null && 
          exists(/databases/$(database)/documents/familyChats/$(chatId));
        allow create: if request.auth.uid == request.resource.data.senderId;
        allow update, delete: if request.auth.uid == resource.data.senderId;
      }
    }
    
    // Calendar events
    match /familyEvents/{eventId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Tasks
    match /familyTasks/{taskId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.assignedBy || 
        request.auth.uid == resource.data.assignedTo;
      allow delete: if request.auth.uid == resource.data.assignedBy;
    }
    
    // User stats (leaderboard)
    match /userStats/{userId} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Expenses
    match /familyExpenses/{expenseId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.paidBy;
    }
    
    // Budgets
    match /familyBudgets/{budgetId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Allowances
    match /familyAllowances/{allowanceId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if request.auth.uid != null;
    }
    
    // Safety check-ins
    match /safetyCheckIns/{checkInId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Step 6: Firebase Storage Rules

Create `storage.rules` file:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Chat files
    match /chat-files/{userId}/{fileName=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId && 
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
    
    // Profile photos
    match /profile-photos/{userId}/{fileName=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId && 
        request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
    
    // Receipts
    match /receipts/{userId}/{fileName=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId && 
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

---

## Step 7: Deploy to Firebase

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy everything
firebase deploy
```

---

## Step 8: Initialize Sample Data (Optional)

You can create a script to initialize sample data:

```typescript
// scripts/initSampleData.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/config/firebase';

export async function initSampleData() {
  try {
    // Add sample user
    const usersRef = collection(db, 'users');
    await addDoc(usersRef, {
      uid: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      familyId: 'family123',
      createdAt: serverTimestamp(),
    });
    
    console.log('Sample data initialized!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
```

---

## Step 9: Verify Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Check **Firestore Database** tab - collections should appear as you add data
4. Check **Storage** tab - buckets should be ready for uploads
5. Check **Authentication** tab - set up sign-in methods (Email/Google)

---

## Common Issues & Solutions

### Issue: "Permission denied" errors
**Solution**: Check Firestore security rules and make sure user is authenticated

### Issue: Environment variables not loading
**Solution**: Restart dev server after adding `.env.local` file

### Issue: Firebase app initialization fails
**Solution**: Verify all environment variables are correctly set from Firebase Console

### Issue: Storage uploads failing
**Solution**: Check storage rules and ensure file size is under limit

---

## Next Steps

1. ✅ Create `.env.local` with Firebase credentials
2. ✅ Run `firebase init` to initialize project
3. ✅ Deploy security rules to Firebase
4. ✅ Test authentication with Firebase Console
5. ✅ Verify collections exist and data can be written
6. ✅ Run your app and test features

**Your app is ready to connect to Firestore!**

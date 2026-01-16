# How to See JoFamily Features on the Website

**Last Updated:** January 15, 2026  
**For:** Phase 5 Features (Web App)

---

## Quick Start: Run the Web App

### 1. Prerequisites
- Node.js 20+ installed (`node --version`)
- Firebase project configured (`.env` file with `VITE_FIREBASE_*` keys)

### 2. Install & Run
```bash
cd C:\Users\Osama Al-Momani\JoFamily\jofamily-web\jofamily-web
npm install
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
firebase deploy --only hosting
```

Visit your deployed URL: `https://jofamily-acc6c.web.app`

---

## Phase 5 Features Available NOW

### ✅ Core Features (Phase 1-4)

#### 1. **Authentication & User Management**
- **URL:** `/login` or `/signup`
- **Features:**
  - Email/password login
  - Account creation
  - User profile management
- **Try it:** Create account → Login → Access all features

#### 2. **Chat & Messaging**
- **URL:** `/chat`
- **Features:**
  - Real-time family chat
  - Message history (Firestore sync)
  - Typing indicators
  - Online/offline status
- **Try it:** Login → Click "Chat" → Send messages

#### 3. **Calendar & Events**
- **URL:** `/calendar`
- **Features:**
  - Family calendar view
  - Event creation/editing
  - Event reminders
  - Shared family events
- **Try it:** Login → Click "Calendar" → Create event

#### 4. **Tasks & To-Dos**
- **URL:** `/tasks`
- **Features:**
  - Task lists (personal & family)
  - Task assignment
  - Due dates & priorities
  - Task completion tracking
- **Try it:** Login → Click "Tasks" → Add task

#### 5. **Budget & Expense Tracking**
- **URL:** `/budget`
- **Features:**
  - Expense tracking
  - Budget categories
  - Monthly spending view
  - Expense charts & insights
  - Family budget sharing
- **Try it:** Login → Click "Budget" → Add expense

#### 6. **Safety & Emergency**
- **URL:** `/safety`
- **Features:**
  - Emergency contacts
  - Safety check-ins
  - Location sharing (planned)
  - Emergency alerts
- **Try it:** Login → Click "Safety" → Add emergency contact

---

### 🎥 Real-Time Communication (RTC)

#### 7. **WebRTC Video/Audio Practice**
- **URL:** `/rtc-practice` or `/rtc-practice/room123`
- **Features:**
  - Peer-to-peer video calls
  - Screen sharing
  - Microphone controls
  - Camera device selection
  - Audio level monitoring
- **Try it:**
  1. Go to `/rtc-practice`
  2. Click "Start camera"
  3. Click "Share screen"
  4. Open `/rtc-practice/room123` in another tab to test P2P

**Technical Note:** Uses WebRTC (no server relay), signaling via Firebase Realtime Database. See [docs/guides/RTC.md](RTC.md) for architecture details.

---

### 🏠 Rooms & Group Management

#### 8. **Family Rooms**
- **URL:** `/rooms`
- **Features:**
  - Create/join family rooms
  - Room-based chat/calendar/tasks
  - Multi-family support
- **Try it:** Login → Click "Rooms" → Create room

---

## Phase 5 Features (Advanced - Partially Implemented)

### 📱 Mobile App (React Native + Expo)

**Status:** Scaffolded, ready for `npm install`  
**Location:** `mobile/` folder  
**How to run:**
```bash
cd mobile
npm install
npm run start
# Press 'a' for Android or 'i' for iOS (macOS only)
```

**Features Available:**
- Home screen with navigation
- 6 placeholder screens (Chat, Calendar, Tasks, Budget, Safety, Auth)
- Firebase integration ready
- Offline sync ready (not yet wired)

**See:** [mobile/README.md](../../mobile/README.md) for full setup guide (Windows)

---

### 🖥️ Desktop App (Electron)

**Status:** Template ready, not yet packaged  
**Location:** Planned for `desktop/` folder  
**Features Planned:**
- Native Windows/macOS/Linux app
- System tray integration
- Auto-updates
- Native notifications

**To implement:** Follow Phase 5 Implementation Plan

---

### 🤖 AI/ML Features (Infrastructure Ready)

**Status:** Vertex AI + BigQuery configured, ML services scaffolded  
**Location:** `src/services/phase4Service.ts` (ML placeholders)  

**Features Planned:**
- Predictive task completion
- Expense auto-categorization (95%+ accuracy)
- Spending behavior prediction
- Sentiment analysis
- Anomaly detection

**Current State:** Infrastructure ready; model training/deployment pending

**See:** [docs/roadmaps/PHASE5_IMPLEMENTATION_PLAN.md](../roadmaps/PHASE5_IMPLEMENTATION_PLAN.md) for ML setup

---

### 🔐 Enterprise Security (Scaffolded)

**Features Ready:**
- SSO/SAML integration (code ready, not wired)
- RBAC matrix designed
- Audit logging infrastructure
- KMS encryption ready
- GDPR compliance framework

**See:** Phase 5 Implementation Plan for activation steps

---

### 🌍 Global Localization (Framework Ready)

**Features Ready:**
- i18n framework (30+ languages supported)
- Multi-currency support
- Region-specific configs
- Payment method localization

**Current State:** Framework ready; translations pending

---

## How to Test Each Feature Area

### For Developers

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** `http://localhost:5173`

3. **Test flow:**
   - Create account at `/signup`
   - Login at `/login`
   - Navigate to each feature via home page or direct URLs

4. **Check console:** Open DevTools (F12) to see Firebase operations, errors, logs

5. **Check Firestore:** Go to [Firebase Console](https://console.firebase.google.com) → Firestore Database to see data

### For Product Testing

**User Journey 1: Family Setup**
1. Create account → Login
2. Go to `/rooms` → Create "Smith Family" room
3. Invite members (planned feature)
4. Test chat, calendar, tasks within room

**User Journey 2: Budget Tracking**
1. Login → Go to `/budget`
2. Add expenses (grocery, rent, etc.)
3. View spending chart
4. Set budget limits (planned)
5. See alerts when over budget (planned)

**User Journey 3: Real-Time Communication**
1. Go to `/rtc-practice/testroom`
2. Open same URL in another tab/device
3. Start camera/mic
4. Test video/audio/screen share

---

## Feature Completion Status

### ✅ Fully Implemented (Phase 1-4)
- Authentication
- Chat
- Calendar
- Tasks
- Budget tracking
- Safety features
- WebRTC practice

### 🚧 Partially Implemented (Phase 5)
- Mobile app (scaffolded)
- Desktop app (planned)
- ML/AI (infrastructure ready)
- Enterprise security (code ready)
- Localization (framework ready)

### 📋 Planned (Phase 6)
- Banking integration (Plaid)
- AI agents (budget, savings, billing)
- Integrations (Slack, Google, Microsoft)
- AR/VR features
- Advanced analytics

**See:** [docs/roadmaps/PHASE6_ROADMAP.md](../roadmaps/PHASE6_ROADMAP.md) for Phase 6 details

---

## Firebase Console Access

**View live data:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "jofamily-acc6c" project
3. Navigate to:
   - **Firestore Database** → See all data (users, messages, events, tasks, expenses)
   - **Authentication** → See registered users
   - **Hosting** → See deployed URLs
   - **Functions** → See Cloud Functions logs

---

## Troubleshooting

### "Missing Firebase env vars" error
- Create `.env` file in `jofamily-web/jofamily-web/`
- Copy from `.env.example`
- Fill values from Firebase Console → Project Settings → Your apps (Web)
- Restart dev server

### Features not loading
- Check browser console (F12) for errors
- Verify Firebase connection (see Network tab)
- Ensure you're logged in

### Build fails
- Run `npm install` again
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `dist`, reinstall

---

## Next Steps

### To See More Features:
1. **Activate Mobile App:** Follow [mobile/README.md](../../mobile/README.md)
2. **Enable ML Features:** Follow Phase 5 Implementation Plan ML section
3. **Deploy to Production:** `npm run build && firebase deploy`

### To Build Phase 6 Features:
- See [docs/deliverables/PHASE6_STARTUP.md](../deliverables/PHASE6_STARTUP.md) for week-by-week execution
- Start with banking integration (Plaid)
- Then AI agents (budget optimization)

---

**Questions?** Check [docs/guides/TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [docs/guides/QUICK_REFERENCE.md](QUICK_REFERENCE.md)

---

## Detailed UI Usage Guide

### 1. Authentication Flow

**Step-by-step:**
1. Visit `/signup`
2. Enter email, password, display name
3. Click "Create Account"
4. Automatically redirected to `/login`
5. Enter credentials → Access home page

**UI Elements:**
- Login form: email input, password input, "Login" button
- Signup form: email, password, name, "Sign Up" button
- Error messages appear below forms

**Testing Tips:**
- Try creating account with existing email → See error
- Try logging in with wrong password → See error
- Successful login → Redirected to home

---

### 2. Chat Feature - Step-by-Step

**Access:** Click "Chat" from home or visit `/chat`

**UI Walkthrough:**
1. **Thread List (Left Panel):**
   - Shows all chat threads
   - Click any thread → Load messages
   - "New Thread" button → Create new conversation

2. **Create New Thread:**
   - Click "+" or "New Thread"
   - Enter thread name (e.g., "Family Planning")
   - Add members (select from dropdown)
   - Click "Create"

3. **Send Messages:**
   - Type in bottom text box
   - Press Enter or click Send
   - Message appears in thread with timestamp

4. **Real-time Features:**
   - See typing indicators ("User is typing...")
   - Messages update instantly (no refresh needed)
   - Scroll to see message history

5. **Message Actions:**
   - Click reaction emoji → Add reaction to message
   - Click reply icon → Reply to specific message
   - Upload media → Click attachment icon

**What You'll See:**
- Messages displayed in chat bubbles
- Timestamps on each message
- Online/offline indicators (green dot)
- Unread message counts on threads

---

### 3. Calendar Feature - Step-by-Step

**Access:** Click "Calendar" from home or visit `/calendar`

**UI Walkthrough:**
1. **Month View:**
   - See full month calendar
   - Events shown as colored blocks
   - Click any date → View day's events

2. **Create Event:**
   - Click "Add Event" or click on a date
   - Fill form:
     - Event title (required)
     - Description (optional)
     - Start date/time
     - End date/time
     - Location
     - Attendees (family members)
     - Color (for visual grouping)
   - Click "Save"

3. **View Event Details:**
   - Click event block
   - See full details in popup
   - Edit or Delete buttons available

4. **Conflict Detection:**
   - When creating event, system checks if attendees have conflicts
   - Warning shown: "John has another event at this time"
   - Choose to proceed or reschedule

5. **Reminders:**
   - Set reminder (5, 15, 30 min, 1 hour before)
   - Notification appears at reminder time

**What You'll See:**
- Color-coded events
- Today highlighted
- Upcoming events sidebar
- Conflict warnings in red

---

### 4. Tasks Feature - Step-by-Step

**Access:** Click "Tasks" from home or visit `/tasks`

**UI Walkthrough:**
1. **Task List View:**
   - All tasks displayed
   - Filter by: All, My Tasks, Completed, Pending
   - Sort by due date or priority

2. **Create Task:**
   - Click "Add Task"
   - Enter:
     - Task title (required)
     - Description
     - Assign to (family member)
     - Due date
     - Priority (Low, Medium, High)
   - Click "Create"

3. **Complete Task:**
   - Check checkbox next to task
   - Task moves to "Completed" section
   - Points awarded (if enabled)

4. **Task Details:**
   - Click task → See full details
   - Edit, Delete, or Change status
   - View assigned person and due date

5. **Leaderboard (Gamification):**
   - See points earned by completing tasks
   - Family leaderboard shows top contributors
   - Badges/achievements unlocked

**What You'll See:**
- Task cards with priority colors
- Checkboxes for completion
- Due dates with countdown ("Due in 2 days")
- Overdue tasks in red

---

### 5. Budget/Expense Tracker - Step-by-Step

**Access:** Click "Budget" from home or visit `/budget`

**UI Walkthrough:**
1. **Dashboard View:**
   - Total spent this month
   - Budget vs. actual chart
   - Category breakdown (pie chart)
   - Recent expenses list

2. **Add Expense:**
   - Click "Add Expense"
   - Fill form:
     - Description (e.g., "Groceries at Walmart")
     - Amount ($50.00)
     - Category (Food, Transport, Entertainment, etc.)
     - Date
     - Paid by (select family member)
   - Click "Save"

3. **Create Budget:**
   - Click "Set Budget"
   - Choose category
   - Set monthly limit ($500)
   - Click "Create"

4. **View Spending:**
   - Charts auto-update
   - See spending trends over time
   - Progress bars show budget usage
   - Alert if over budget

5. **Expense History:**
   - List of all expenses
   - Filter by date range, category, person
   - Export to CSV

**What You'll See:**
- Spending chart (line/bar graph)
- Budget progress bars (green = under, red = over)
- Category breakdown (pie chart)
- Expense cards with icons

---

### 6. Safety Feature - Step-by-Step

**Access:** Click "Safety" from home or visit `/safety`

**UI Walkthrough:**
1. **Emergency Contacts:**
   - List of saved emergency contacts
   - Click "Add Contact"
   - Enter: Name, Phone, Relationship
   - Click "Save"

2. **SOS Alert:**
   - Big red "SOS" button
   - Click → Sends alert to all family members
   - Shares your location (if enabled)
   - Call emergency services option

3. **Location Sharing:**
   - Toggle "Share Location" switch
   - Family members see your location on map
   - Set sharing duration (1 hour, 8 hours, Always)

4. **Safe Zones:**
   - Define safe areas (Home, School, Work)
   - Get alert when family member enters/leaves zone
   - See zone boundaries on map

5. **Check-ins:**
   - "I'm Safe" button
   - Sends notification to family
   - Automated check-in reminders

**What You'll See:**
- Map showing family locations
- Emergency contact cards
- SOS button (prominent red)
- Safe zone boundaries on map

---

### 7. WebRTC Practice - Step-by-Step

**Access:** Visit `/rtc-practice` or `/rtc-practice/room123`

**UI Walkthrough:**
1. **Video Panels:**
   - Local video (your camera) - left side
   - Remote video (other person) - right side

2. **Start Video Call:**
   - Click "Start camera" → Camera turns on
   - See yourself in local video panel

3. **Screen Sharing:**
   - Click "Share screen"
   - Select window/screen to share
   - Remote user sees your screen

4. **Audio Controls:**
   - Click "Start mic" → Enable microphone
   - See audio level meter (bars)
   - Click "Stop mic" → Mute

5. **Device Selection:**
   - Dropdown: Choose camera
   - Dropdown: Choose microphone
   - Click "Refresh devices" after plugging/unplugging

6. **Join Room:**
   - Enter room ID in URL: `/rtc-practice/room123`
   - Open same URL in another tab → Connect P2P
   - Video/audio auto-connects

**What You'll See:**
- Two video panels (local and remote)
- Control buttons (Start/Stop camera, mic, screen)
- Audio level visualization
- Device selection dropdowns

**Testing P2P:**
1. Open `/rtc-practice/testroom` in Tab 1
2. Open same URL in Tab 2 (or another device)
3. Start camera in both → See each other
4. Talk → Hear audio in both tabs

---

## Available APIs for Future Development

### Authentication APIs
```typescript
// Firebase Auth (already integrated)
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Usage
const auth = getAuth();
await createUserWithEmailAndPassword(auth, email, password);
await signInWithEmailAndPassword(auth, email, password);
await signOut(auth);
```

---

### Chat APIs

**Location:** `src/services/chatService.ts`

```typescript
// Listen to chat threads (real-time)
import { listenToThreads } from '@/services/chatService';
listenToThreads((threads) => {
  console.log('Threads updated:', threads);
});

// Create new thread
import { createThread } from '@/services/chatService';
const threadId = await createThread({
  name: 'Family Planning',
  members: ['user1', 'user2']
});

// Listen to messages in a thread
import { listenToMessages } from '@/services/chatService';
listenToMessages('thread123', (messages) => {
  console.log('New messages:', messages);
});

// Send message
import { sendMessage } from '@/services/chatService';
await sendMessage({
  threadId: 'thread123',
  authorId: 'user1',
  authorName: 'John',
  text: 'Hello family!',
  mediaUrl: null // or URL for images/files
});

// Add reaction to message
import { addReaction } from '@/services/chatService';
await addReaction('thread123', 'message456', 'user1', '❤️');

// Show typing indicator
import { setTyping } from '@/services/chatService';
await setTyping('thread123', 'user1', 'John', true);

// Search messages
import { searchMessages } from '@/services/chatService';
const results = await searchMessages({
  threadId: 'thread123',
  query: 'birthday',
  authorId: 'user1' // optional
});
```

---

### Calendar APIs

**Location:** `src/services/calendarService.ts`

```typescript
// Listen to events (real-time)
import { listenToEvents } from '@/services/calendarService';
listenToEvents((events) => {
  console.log('Events updated:', events);
});

// Create event
import { createEvent } from '@/services/calendarService';
await createEvent({
  title: 'Family Dinner',
  description: 'Monthly family gathering',
  start: new Date('2026-02-01T18:00'),
  end: new Date('2026-02-01T20:00'),
  location: 'Home',
  attendees: ['user1', 'user2'],
  createdBy: 'user1',
  reminderMinutes: 30,
  color: '#8b5cf6'
});

// Check for conflicts
import { detectConflicts } from '@/services/calendarService';
const conflicts = detectConflicts(
  new Date('2026-02-01T18:00'),
  new Date('2026-02-01T20:00'),
  existingEvents,
  ['user1', 'user2']
);

// Update event
import { updateEvent } from '@/services/calendarService';
await updateEvent('event123', {
  title: 'Updated Title',
  start: new Date('2026-02-02T18:00')
});

// Delete event
import { deleteEvent } from '@/services/calendarService';
await deleteEvent('event123');

// Export to ICS (calendar file)
import { exportEventsToICS } from '@/services/calendarService';
const icsContent = exportEventsToICS(events);
```

---

### Task APIs

**Location:** `src/services/taskService.ts`

```typescript
// Listen to all tasks
import { listenToTasks } from '@/services/taskService';
listenToTasks((tasks) => {
  console.log('Tasks updated:', tasks);
});

// Listen to user's tasks only
import { listenToUserTasks } from '@/services/taskService';
listenToUserTasks('user123', (tasks) => {
  console.log('User tasks:', tasks);
});

// Create task
import { createTask } from '@/services/taskService';
const taskId = await createTask({
  title: 'Take out trash',
  description: 'Weekly chore',
  assignedTo: 'user1',
  assignedToName: 'John',
  dueDate: new Date('2026-02-01'),
  priority: 'high',
  category: 'chores',
  estimatedMinutes: 15
});

// Update task status
import { updateTaskStatus } from '@/services/taskService';
await updateTaskStatus('task123', 'completed');

// Award points
import { awardPoints } from '@/services/taskService';
await awardPoints('user1', 'John', 50);

// Listen to leaderboard
import { listenToLeaderboard } from '@/services/taskService';
listenToLeaderboard((stats) => {
  console.log('Leaderboard:', stats);
});

// Filter tasks
import { filterTasks } from '@/services/taskService';
const filtered = await filterTasks({
  status: 'pending',
  assignedTo: 'user1',
  priority: 'high',
  category: 'chores'
});

// Search tasks
import { searchTasks } from '@/services/taskService';
const results = searchTasks(allTasks, 'trash');
```

---

### Budget/Expense APIs

**Location:** `src/services/budgetService.ts`

```typescript
// Listen to expenses
import { listenToExpenses } from '@/services/budgetService';
listenToExpenses((expenses) => {
  console.log('Expenses:', expenses);
});

// Create expense
import { createExpense } from '@/services/budgetService';
await createExpense({
  description: 'Groceries at Walmart',
  amount: 125.50,
  category: 'food',
  paidBy: 'user1',
  paidByName: 'John',
  date: new Date()
});

// Listen to budgets
import { listenToBudgets } from '@/services/budgetService';
listenToBudgets((budgets) => {
  console.log('Budgets:', budgets);
});

// Create budget
import { createBudget } from '@/services/budgetService';
await createBudget({
  name: 'Monthly Food Budget',
  category: 'food',
  limit: 500,
  period: 'monthly',
  createdBy: 'user1'
});

// Update expense
import { updateExpense } from '@/services/budgetService';
await updateExpense('expense123', {
  amount: 130.00,
  description: 'Updated description'
});

// Delete expense
import { deleteExpense } from '@/services/budgetService';
await deleteExpense('expense123');

// Get spending by category
import { getSpendingByCategory } from '@/services/budgetService';
const categoryTotals = getSpendingByCategory(expenses);
// Returns: { food: 500, transport: 200, ... }

// Check budget alerts
import { checkBudgetAlerts } from '@/services/budgetService';
const alerts = checkBudgetAlerts(budgets, expenses);
```

---

### Safety APIs

**Location:** `src/services/safetyService.ts`

```typescript
// Listen to user locations
import { listenToUserLocations } from '@/services/safetyService';
listenToUserLocations((locations) => {
  console.log('Family locations:', locations);
});

// Update user location
import { updateUserLocation } from '@/services/safetyService';
await updateUserLocation({
  userId: 'user1',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
  sharingEnabled: true,
  sharingUntil: new Date('2026-02-01T18:00')
});

// Create safe zone
import { createSafeZone } from '@/services/safetyService';
await createSafeZone({
  name: 'Home',
  centerLat: 40.7128,
  centerLng: -74.0060,
  radiusMeters: 100,
  notifyOnEntry: true,
  notifyOnExit: true,
  members: ['user1', 'user2']
});

// Listen to SOS alerts
import { listenToSOSAlerts } from '@/services/safetyService';
listenToSOSAlerts((alerts) => {
  console.log('SOS Alerts:', alerts);
});

// Create SOS alert
import { createSOSAlert } from '@/services/safetyService';
await createSOSAlert({
  userId: 'user1',
  userName: 'John',
  latitude: 40.7128,
  longitude: -74.0060,
  message: 'Emergency!'
});

// Resolve SOS alert
import { resolveSOSAlert } from '@/services/safetyService';
await resolveSOSAlert({
  alertId: 'alert123',
  resolvedBy: 'user2',
  resolvedByName: 'Jane'
});

// Calculate distance between two points
import { calculateDistance } from '@/services/safetyService';
const distanceKm = calculateDistance(40.7128, -74.0060, 40.7589, -73.9851);

// Check if location is inside safe zone
import { checkIfInsideSafeZone } from '@/services/safetyService';
const isInside = checkIfInsideSafeZone(
  40.7128, -74.0060,
  { centerLat: 40.7128, centerLng: -74.0060, radiusMeters: 100 }
);
```

---

### Phase 4 Advanced APIs

**Location:** `src/services/phase4Service.ts`

```typescript
// Dashboard metrics
import { getDashboardMetrics } from '@/services/phase4Service';
const metrics = await getDashboardMetrics();
// Returns: activeUsers, totalExpenses, completedTasks, unreadMessages, todayEvents, pendingAlerts

// Spending trends
import { getSpendingTrends } from '@/services/phase4Service';
const trends = await getSpendingTrends(6); // last 6 months

// Time analytics
import { getTimeAnalytics } from '@/services/phase4Service';
const timeData = await getTimeAnalytics();
// Returns: task completion times, event durations, etc.

// Video call management
import { initializeVideoCall, updateCallStatus, endVideoCall } from '@/services/phase4Service';
const callId = await initializeVideoCall('user1', ['user2', 'user3']);
await updateCallStatus(callId, 'connected');
await endVideoCall(callId, 'https://recording-url.com');

// Parental controls
import { setParentalControl, listenToParentalControls } from '@/services/phase4Service';
await setParentalControl({
  userId: 'child1',
  dailyScreenTimeMinutes: 120,
  allowedApps: ['youtube', 'educational'],
  blockedWebsites: ['example.com'],
  curfewStart: '22:00',
  curfewEnd: '07:00'
});

// Real-time location tracking
import { trackRealTimeLocation } from '@/services/phase4Service';
await trackRealTimeLocation({
  userId: 'user1',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
  speed: 0,
  heading: null
});

// Automation rules
import { createAutomationRule, executeAutomationRule } from '@/services/phase4Service';
const ruleId = await createAutomationRule({
  name: 'Auto-pay rent',
  trigger: { type: 'schedule', cronExpression: '0 0 1 * *' },
  action: { type: 'payment', amount: 1500, category: 'housing' },
  enabled: true
});

// AI Insights
import { generateAIInsights } from '@/services/phase4Service';
const insights = await generateAIInsights('family123');
// Returns: spending suggestions, task prioritization, anomaly detection
```

---

### Cross-Feature APIs

**Location:** `src/services/crossFeatureService.ts`

```typescript
// User preferences
import { saveUserPreferences, listenToUserPreferences } from '@/services/crossFeatureService';
await saveUserPreferences({
  userId: 'user1',
  theme: 'dark',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    shareLocation: true,
    profileVisibility: 'family'
  }
});

// Push notifications
import { savePushNotificationSettings } from '@/services/crossFeatureService';
await savePushNotificationSettings({
  userId: 'user1',
  fcmToken: 'firebase-cloud-messaging-token',
  enabled: true,
  categories: {
    chat: true,
    tasks: true,
    events: true,
    budget: false
  }
});

// User profile
import { createUserProfile } from '@/services/crossFeatureService';
await createUserProfile({
  userId: 'user1',
  displayName: 'John Doe',
  email: 'john@example.com',
  photoURL: 'https://example.com/photo.jpg',
  familyId: 'family123',
  role: 'admin',
  bio: 'Father of two'
});
```

---

### File Upload API

**Location:** `src/services/fileService.ts`

```typescript
// Upload file to Firebase Storage
import { uploadFile } from '@/services/fileService';
const fileUrl = await uploadFile(file, 'chat-media/image.jpg');
// Returns: public URL to uploaded file
```

---

## API Integration Examples

### Example 1: Create Task When Message Received
```typescript
import { listenToMessages, sendMessage } from '@/services/chatService';
import { createTask } from '@/services/taskService';

listenToMessages('thread123', async (messages) => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage.text.includes('@todo')) {
    // Auto-create task from message
    await createTask({
      title: lastMessage.text.replace('@todo', '').trim(),
      assignedTo: lastMessage.authorId,
      assignedToName: lastMessage.authorName,
      priority: 'medium'
    });
  }
});
```

### Example 2: Budget Alert via Chat
```typescript
import { listenToExpenses } from '@/services/budgetService';
import { sendMessage } from '@/services/chatService';

listenToExpenses(async (expenses) => {
  const thisMonth = expenses.filter(e => 
    e.date.getMonth() === new Date().getMonth()
  );
  const total = thisMonth.reduce((sum, e) => sum + e.amount, 0);
  
  if (total > 2000) {
    await sendMessage({
      threadId: 'family-thread',
      authorId: 'system',
      authorName: 'Budget Bot',
      text: `⚠️ Monthly spending exceeded $2000! Current: $${total}`
    });
  }
});
```

### Example 3: Auto-Task from Calendar Event
```typescript
import { listenToEvents } from '@/services/calendarService';
import { createTask } from '@/services/taskService';

listenToEvents(async (events) => {
  const upcomingEvents = events.filter(e => 
    e.start > new Date() && e.start < addHours(new Date(), 24)
  );
  
  upcomingEvents.forEach(async (event) => {
    if (event.title.includes('Meeting')) {
      await createTask({
        title: `Prepare for ${event.title}`,
        dueDate: subHours(event.start, 1),
        priority: 'high',
        assignedTo: event.createdBy
      });
    }
  });
});
```

---

## Future API Opportunities

### Phase 6 APIs (Planned)
- **Banking:** Plaid integration for account linking, transaction sync
- **AI Agents:** Budget optimizer, savings coach, bill negotiator
- **Integrations:** Slack bot, Google Calendar sync, Microsoft Teams
- **Analytics:** Custom dashboards, export reports, predictive insights
- **AR/VR:** Mobile AR receipt scanner, VR planning room

See [docs/roadmaps/PHASE6_ROADMAP.md](../roadmaps/PHASE6_ROADMAP.md) for full Phase 6 API plans.

---

**Questions?** Check [docs/guides/TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [docs/guides/QUICK_REFERENCE.md](QUICK_REFERENCE.md)

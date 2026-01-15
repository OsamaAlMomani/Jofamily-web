# Feature Delivery Log

**Last Updated**: January 15, 2026

## Feature 1: Real-Time Family Chat (Phase 1)
- Status: ✅ Complete (Phase 1 delivered)
- Scope (Phase 1):
  - Real-time threads + messages using Firestore
  - Authenticated users can create threads and send messages
  - Delivery & seen status tracking for messages
  - Typing indicators with user names
  - Per-user pin/mute thread controls
  - Thread sorting (pinned first, then by recent activity)
  - Unread message counts per thread
  - Optional media URL attachments
  - Delete own messages (self-moderation)
  - Clean composer with blur/unmount typing cleanup
- Completed Today:
  - Implemented Firestore chat service (`src/services/chatService.ts`)
  - Added comprehensive chat types (`src/types/chat.ts`)
  - Built full-featured Chat page (`/chat`) with thread management
  - Pin/mute toggles with user-specific state (arrays in Firestore)
  - Thread list shows badges: Pinned, Muted, Unread count
  - Messages show "Sent" vs "Seen" status
  - Typing indicator displays actual user names, pluralizes correctly
  - Auto-marks messages as seen when viewing thread
  - Clears unread count after marking seen
  - Media URL support in composer and message display
  - Delete button for own messages (soft delete to "[deleted]")
- Next Steps (Phase 2 - Future):
  - File upload to Firebase Storage (replace URL input)
  - Voice/video messages
  - Thread admin/member management UI
  - Message reactions and replies
  - Advanced moderation (admin delete, block users)

## Feature 2: Shared Family Calendar
- Status: In Progress (live Firestore events)
- Scope (Phase 1):
  - Create/list family events (title, date/time, location)
  - Color-coded events grouped by day
  - Auth guard for creation
- Completed Today:
  - Calendar page with create form and grouped event list (`/calendar`)
  - Firestore-backed event service (`src/services/calendarService.ts`)
  - Calendar types added (`src/types/calendar.ts`)
  - Navigation link and route wired; feature table auto-updates
- Next Steps:
  - Reminders/notifications
  - Attendees and conflict detection
  - Recurring events and ICS export

## Feature 3: Family Task & Chore Management
- Status: Planned
- Notes: Assign/track chores with gamification (points, badges, leaderboards).

## Feature 4: Family Budget & Expenses
- Status: Planned
- Notes: Shared budgets, allowances, expense tracking, and insights.

## Feature 5: Family Safety & Location
- Status: Planned
- Notes: Opt-in location sharing, safe zones, SOS alerts.

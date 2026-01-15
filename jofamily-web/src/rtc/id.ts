// Shared ID helpers used across RTC pages.
//
// Why this exists:
// - We generate room IDs in more than one place (Rooms page, RTCPractice page).
// - Keeping generation in one file keeps behavior consistent.

/**
 * Generates a room id suitable for URLs.
 * Uses crypto.randomUUID() when available, otherwise falls back.
 */
export function generateRoomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID();
  }

  return `room-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

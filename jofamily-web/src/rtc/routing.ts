// Shared routing helpers for RTC-related pages.
//
// Why this exists:
// - We want one canonical URL shape for rooms.
// - Multiple screens (Rooms page, RTCPractice) need to create/copy links.

/** Returns the route path for a room page (client-side route). */
export function buildRtcRoomPath(roomId: string): string {
  return `/rtc-practice/${encodeURIComponent(roomId)}`;
}

/** Returns an absolute link that you can share with other users. */
export function buildRtcRoomLink(roomId: string): string {
  return `${window.location.origin}${buildRtcRoomPath(roomId)}`;
}

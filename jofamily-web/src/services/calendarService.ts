import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CalendarEvent, CreateEventInput } from '../types/calendar';

const eventsCollection = collection(db, 'familyEvents');

export function listenToEvents(callback: (events: CalendarEvent[]) => void) {
  const q = query(eventsCollection, orderBy('start', 'asc'));
  return onSnapshot(q, (snap) => {
    const events: CalendarEvent[] = snap.docs.map((d) => {
      const data = d.data();
      const start = data.start instanceof Timestamp ? data.start.toDate() : new Date();
      const end = data.end instanceof Timestamp ? data.end.toDate() : start;
      return {
        id: d.id,
        title: data.title ?? 'Untitled',
        description: data.description ?? '',
        location: data.location ?? '',
        attendees: data.attendees ?? [],
        color: data.color ?? '#8b5cf6',
        createdBy: data.createdBy ?? 'unknown',
        reminderMinutes: data.reminderMinutes ?? null,
        isRecurring: data.isRecurring ?? false,
        recurrenceRule: data.recurrenceRule ?? null,
        start,
        end,
      };
    });
    callback(events);
  });
}

export async function createEvent(input: CreateEventInput) {
  await addDoc(eventsCollection, {
    title: input.title,
    description: input.description ?? '',
    start: input.start,
    end: input.end,
    location: input.location ?? '',
    attendees: input.attendees ?? [],
    color: input.color ?? '#8b5cf6',
    createdBy: input.createdBy,
    reminderMinutes: input.reminderMinutes ?? null,
    isRecurring: input.isRecurring ?? false,
    recurrenceRule: input.recurrenceRule ?? null,
    createdAt: serverTimestamp(),
  });
}

export function detectConflicts(
  newStart: Date,
  newEnd: Date,
  existingEvents: CalendarEvent[],
  attendees: string[]
): CalendarEvent[] {
  return existingEvents.filter((ev) => {
    const overlaps = ev.start < newEnd && ev.end > newStart;
    const sharesAttendee = attendees.some((a) => ev.attendees?.includes(a));
    return overlaps && sharesAttendee;
  });
}

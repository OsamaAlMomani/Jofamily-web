import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { CalendarEvent, CreateEventInput, UpdateEventInput } from '../types/calendar';

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

export async function updateEvent(eventId: string, input: UpdateEventInput) {
  const eventRef = doc(db, 'familyEvents', eventId);
  const updateData: any = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.start !== undefined) updateData.start = input.start;
  if (input.end !== undefined) updateData.end = input.end;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.attendees !== undefined) updateData.attendees = input.attendees;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.reminderMinutes !== undefined) updateData.reminderMinutes = input.reminderMinutes;
  if (input.isRecurring !== undefined) updateData.isRecurring = input.isRecurring;
  if (input.recurrenceRule !== undefined) updateData.recurrenceRule = input.recurrenceRule;

  await updateDoc(eventRef, updateData);
}

export async function deleteEvent(eventId: string) {
  const eventRef = doc(db, 'familyEvents', eventId);
  await deleteDoc(eventRef);
}

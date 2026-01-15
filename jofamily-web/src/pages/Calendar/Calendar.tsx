import { useEffect, useMemo, useState } from 'react';
import './Calendar.css';
import { useAuth } from '../../core';
import { createEvent, detectConflicts, listenToEvents } from '../../services';
import type { CalendarEvent } from '../../types/calendar';

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const unsub = listenToEvents(setEvents);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !date || !startTime || !endTime) {
      setConflicts([]);
      return;
    }
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const found = detectConflicts(start, end, events, [user.uid]);
    setConflicts(found);
  }, [date, startTime, endTime, events, user]);

  const grouped = useMemo(() => {
    const byDay = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const dayKey = ev.start.toDateString();
      if (!byDay.has(dayKey)) byDay.set(dayKey, []);
      byDay.get(dayKey)!.push(ev);
    });
    return Array.from(byDay.entries()).map(([day, items]) => ({ day, items }));
  }, [events]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !date || !startTime || !endTime) return;
    setCreating(true);
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      await createEvent({
        title: title.trim(),
        description: '',
        start,
        end,
        location: location.trim(),
        attendees: [user.uid],
        createdBy: user.uid,
        reminderMinutes,
        isRecurring,
        recurrenceRule: isRecurring ? 'FREQ=WEEKLY' : null,
      });
      setTitle('');
      setLocation('');
      setReminderMinutes(null);
      setIsRecurring(false);
    } finally {
      setCreating(false);
    }
  }

  if (!user) {
    return (
      <div className="cal-page">
        <header className="cal-hero">
          <div className="cal-hero__content">
            <p className="eyebrow">Feature 2 · Sign in required</p>
            <h1>Shared Family Calendar</h1>
            <p className="lede">Sign in to view and create family events.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="cal-page">
      <header className="cal-hero">
        <div className="cal-hero__content">
          <p className="eyebrow">Feature 2 · In Progress</p>
          <h1>Shared Family Calendar</h1>
          <p className="lede">Create and view family events with color-coded clarity.</p>
        </div>
      </header>

      <section className="cal-grid">
        <aside className="cal-form-card">
          <h2>Create Event</h2>
          <form onSubmit={handleCreate} className="cal-form">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Birthday dinner" />
            </label>
            <label>
              Date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <div className="time-row">
              <label>
                Start
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label>
                End
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
            </div>
            <label>
              Location
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Home" />
            </label>
            <label>
              Reminder
              <select value={reminderMinutes ?? ''} onChange={(e) => setReminderMinutes(e.target.value ? Number(e.target.value) : null)}>
                <option value="">No reminder</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
              Recurring (weekly)
            </label>
            {conflicts.length > 0 && (
              <div className="conflict-warning">
                ⚠️ Conflicts with {conflicts.length} event{conflicts.length > 1 ? 's' : ''}
              </div>
            )}
            <button type="submit" disabled={!title.trim() || !date || !startTime || !endTime || creating}>
              {creating ? 'Saving…' : 'Add Event'}
            </button>
          </form>
        </aside>

        <main className="cal-list">
          {grouped.length === 0 && <p className="muted">No events yet. Add one to get started.</p>}
          {grouped.map(({ day, items }) => (
            <div key={day} className="cal-day">
              <div className="cal-day__header">{day}</div>
              <div className="cal-day__events">
                {items.map((ev) => (
                  <div key={ev.id} className="cal-event" style={{ borderLeftColor: ev.color ?? '#8b5cf6' }}>
                    <div className="cal-event__title">{ev.title}</div>
                    <div className="cal-event__time">
                      {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —
                      {ev.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {ev.location && <div className="cal-event__loc">{ev.location}</div>}
                    <div className="cal-event__badges">
                      {ev.reminderMinutes && (
                        <span className="event-badge">🔔 {ev.reminderMinutes}m</span>
                      )}
                      {ev.isRecurring && <span className="event-badge">🔁 Weekly</span>}
                      {(ev.attendees?.length ?? 0) > 1 && (
                        <span className="event-badge">👥 {ev.attendees?.length}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </section>
    </div>
  );
}

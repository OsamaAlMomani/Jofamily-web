import { useEffect, useMemo, useState } from 'react';
import './Calendar.css';
import { useAuth } from '../../core';
import { createEvent, deleteEvent, detectConflicts, listenToEvents, updateEvent } from '../../services';
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
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'month' | 'week' | 'day'>('list');
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const monthGrid = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const grid: (Date | null)[][] = [];
    let week: (Date | null)[] = new Array(startWeekday).fill(null);
    
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(year, month, day));
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }
    return grid;
  }, [selectedDate]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter(ev => ev.start.toDateString() === date.toDateString());
  };

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

  const handleEdit = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDate(ev.start.toISOString().split('T')[0]);
    setStartTime(ev.start.toTimeString().slice(0, 5));
    setEndTime(ev.end.toTimeString().slice(0, 5));
    setLocation(ev.location ?? '');
    setReminderMinutes(ev.reminderMinutes ?? null);
    setIsRecurring(ev.isRecurring ?? false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !title.trim() || !date || !startTime || !endTime) return;
    setUpdating(true);
    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      await updateEvent(editingEvent.id, {
        title: title.trim(),
        start,
        end,
        location: location.trim() || undefined,
        reminderMinutes: reminderMinutes ?? undefined,
        isRecurring: isRecurring || undefined,
        recurrenceRule: isRecurring ? 'FREQ=WEEKLY' : undefined,
      });
      setEditingEvent(null);
      setTitle('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setReminderMinutes(null);
      setIsRecurring(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setReminderMinutes(null);
    setIsRecurring(false);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Delete this event?')) return;
    await deleteEvent(eventId);
  };

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

      <div className="view-switcher">
        <button 
          className={viewMode === 'list' ? 'view-btn active' : 'view-btn'} 
          onClick={() => setViewMode('list')}
        >
          📋 List
        </button>
        <button 
          className={viewMode === 'month' ? 'view-btn active' : 'view-btn'} 
          onClick={() => setViewMode('month')}
        >
          📅 Month
        </button>
        <button 
          className={viewMode === 'week' ? 'view-btn active' : 'view-btn'} 
          onClick={() => setViewMode('week')}
        >
          📆 Week
        </button>
        <button 
          className={viewMode === 'day' ? 'view-btn active' : 'view-btn'} 
          onClick={() => setViewMode('day')}
        >
          📌 Day
        </button>
      </div>

      {(viewMode === 'month' || viewMode === 'week' || viewMode === 'day') && (
        <div className="date-navigator">
          <button onClick={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
            else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
            else newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}>←</button>
          <span className="current-date">
            {viewMode === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {viewMode === 'week' && `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <button onClick={() => setSelectedDate(new Date())}>Today</button>
          <button onClick={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
            else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
            else newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}>→</button>
        </div>
      )}

      <section className="cal-grid">
        <aside className="cal-form-card">
          <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
          <form onSubmit={editingEvent ? handleUpdate : handleCreate} className="cal-form">
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
            <div className="form-actions">
              {editingEvent && (
                <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={!title.trim() || !date || !startTime || !endTime || creating || updating}>
                {editingEvent ? (updating ? 'Updating…' : 'Update Event') : (creating ? 'Saving…' : 'Add Event')}
              </button>
            </div>
          </form>
        </aside>

        {viewMode === 'list' && (
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
                      {user && ev.createdBy === user.uid && (
                        <div className="cal-event__actions">
                          <button onClick={() => handleEdit(ev)} className="event-action-btn" title="Edit">✏️</button>
                          <button onClick={() => handleDelete(ev.id)} className="event-action-btn" title="Delete">🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        )}

        {viewMode === 'month' && (
          <main className="cal-month-view">
            <div className="month-grid">
              <div className="weekday-header">Sun</div>
              <div className="weekday-header">Mon</div>
              <div className="weekday-header">Tue</div>
              <div className="weekday-header">Wed</div>
              <div className="weekday-header">Thu</div>
              <div className="weekday-header">Fri</div>
              <div className="weekday-header">Sat</div>
              {monthGrid.flat().map((date, idx) => (
                <div key={idx} className={`month-day ${!date ? 'empty' : ''} ${date?.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                  {date && (
                    <>
                      <div className="month-day-number">{date.getDate()}</div>
                      <div className="month-day-events">
                        {getEventsForDate(date).slice(0, 3).map(ev => (
                          <div key={ev.id} className="month-event" style={{ backgroundColor: ev.color ?? '#8b5cf6' }} title={ev.title}>
                            {ev.title}
                          </div>
                        ))}
                        {getEventsForDate(date).length > 3 && (
                          <div className="month-event-more">+{getEventsForDate(date).length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </main>
        )}

        {viewMode === 'week' && (
          <main className="cal-week-view">
            <div className="week-grid">
              {weekDays.map((day, idx) => (
                <div key={idx} className={`week-day ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                  <div className="week-day-header">
                    <div className="week-day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="week-day-number">{day.getDate()}</div>
                  </div>
                  <div className="week-day-events">
                    {getEventsForDate(day).map(ev => (
                      <div key={ev.id} className="week-event" style={{ borderLeftColor: ev.color ?? '#8b5cf6' }}>
                        <div className="week-event-time">
                          {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="week-event-title">{ev.title}</div>
                        {ev.location && <div className="week-event-loc">{ev.location}</div>}
                      </div>
                    ))}
                    {getEventsForDate(day).length === 0 && (
                      <div className="week-no-events">No events</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {viewMode === 'day' && (
          <main className="cal-day-view">
            <div className="day-header">
              <h2>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            </div>
            <div className="day-events">
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="muted">No events scheduled for this day.</p>
              )}
              {getEventsForDate(selectedDate).map(ev => (
                <div key={ev.id} className="day-event" style={{ borderLeftColor: ev.color ?? '#8b5cf6' }}>
                  <div className="day-event-time">
                    {ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —
                    {ev.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="day-event-title">{ev.title}</div>
                  {ev.location && <div className="day-event-loc">📍 {ev.location}</div>}
                  <div className="cal-event__badges">
                    {ev.reminderMinutes && (
                      <span className="event-badge">🔔 {ev.reminderMinutes}m</span>
                    )}
                    {ev.isRecurring && <span className="event-badge">🔁 Weekly</span>}
                    {(ev.attendees?.length ?? 0) > 1 && (
                      <span className="event-badge">👥 {ev.attendees?.length}</span>
                    )}
                  </div>
                  {user && ev.createdBy === user.uid && (
                    <div className="cal-event__actions">
                      <button onClick={() => handleEdit(ev)} className="event-action-btn" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(ev.id)} className="event-action-btn" title="Delete">🗑️</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        )}
      </section>
    </div>
  );
}

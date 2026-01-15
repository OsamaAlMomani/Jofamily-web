export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  createdBy: string;
  attendees?: string[];
  color?: string;
  reminderMinutes?: number | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
};

export type CreateEventInput = {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
  color?: string;
  createdBy: string;
  reminderMinutes?: number | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
};

export type UpdateEventInput = {
  title?: string;
  description?: string;
  start?: Date;
  end?: Date;
  location?: string;
  attendees?: string[];
  color?: string;
  reminderMinutes?: number | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
};

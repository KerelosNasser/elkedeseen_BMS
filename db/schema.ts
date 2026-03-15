import { pgTable, text, integer, boolean, timestamp, uniqueIndex, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Helper for shorter, URL-safe IDs
const generateId = () => Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

// Enums
export const roles = ['admin', 'user'] as const;
export const statuses = ['active', 'pending_approval', 'rejected'] as const;

// ── USERS ─────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  role: text('role').$type<typeof roles[number]>().default('user').notNull(),
  status: text('status').$type<typeof statuses[number]>().default('pending_approval').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return [
    index('users_name_idx').on(table.name),
  ];
});

// ── SECTIONS ──────────────────────────────────────────────────
export const sections = pgTable('sections', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  nameAr: text('nameAr').notNull(),
  sortOrder: integer('sortOrder').default(0).notNull(),
});

// ── VENUES ────────────────────────────────────────────────────
export const venues = pgTable('venues', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  nameAr: text('nameAr').notNull(),
  section: text('section').notNull().references(() => sections.id),
  capacity: integer('capacity'),
  isDouble: boolean('isDouble').default(false).notNull(),
  sortOrder: integer('sortOrder').notNull(),
});

// ── BOOKINGS ──────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  venueId: text('venueId').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  bookedBy: text('bookedBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dayOfWeek: integer('dayOfWeek').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  weekDate: text('weekDate').notNull(),
  isRecurring: boolean('isRecurring').default(false).notNull(),
  status: text('status').$type<typeof statuses[number]>().default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  expiresAt: timestamp('expiresAt', { withTimezone: true, mode: 'date' }).notNull(),
}, (table) => {
  return [
    index('bookings_venue_day_idx').on(table.venueId, table.dayOfWeek),
    index('bookings_expires_idx').on(table.expiresAt),
    index('bookings_status_idx').on(table.status),
  ];
});

// ── BOOKING_ATTENDEES ─────────────────────────────────────────
export const bookingAttendees = pgTable('booking_attendees', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  bookingId: text('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return [
    unique('booking_attendees_unique').on(table.bookingId, table.userId),
    index('booking_attendees_booking_idx').on(table.bookingId),
  ];
});

// ── RECURRING_APPROVALS ───────────────────────────────────────
export const recurringApprovals = pgTable('recurring_approvals', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  bookingId: text('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  adminId: text('adminId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approved: boolean('approved').default(false).notNull(),
  votedAt: timestamp('votedAt', { withTimezone: true, mode: 'date' }),
}, (table) => {
  return [
    unique('recurring_approvals_unique').on(table.bookingId, table.adminId),
    index('recurring_approvals_booking_idx').on(table.bookingId),
  ];
});


import { sqliteTable, text, integer, unique, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Helper for shorter, URL-safe IDs (12 chars is plenty for < 1k users)
const generateId = () => Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);

// Enums
export const roles = ['admin', 'user'] as const;
export const sections = ['ground_floor', 'second_floor', 'education_building', 'other', 'dev_center'] as const;
export const statuses = ['active', 'pending_approval', 'rejected'] as const;

// ── USERS ─────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  role: text('role', { enum: roles }).default('user').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now') * 1000)`).notNull(),
}, (table) => {
  return [
    index('users_name_idx').on(table.name),
  ];
});

// ── VENUES ────────────────────────────────────────────────────
export const venues = sqliteTable('venues', {
  id: text('id').primaryKey(), // IDs here are from constants.ts (e.g. ground-floor-main)
  nameAr: text('nameAr').notNull(),
  section: text('section', { enum: sections }).notNull(),
  capacity: integer('capacity'),
  isDouble: integer('isDouble', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sortOrder').notNull(),
});

// ── BOOKINGS ──────────────────────────────────────────────────
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  venueId: text('venueId').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  bookedBy: text('bookedBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dayOfWeek: integer('dayOfWeek').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  weekDate: text('weekDate').notNull(),
  isRecurring: integer('isRecurring', { mode: 'boolean' }).default(false).notNull(),
  status: text('status', { enum: statuses }).default('active').notNull(),
  notes: text('notes'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now') * 1000)`).notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
}, (table) => {
  return [
    index('bookings_venue_day_idx').on(table.venueId, table.dayOfWeek),
    index('bookings_expires_idx').on(table.expiresAt),
    index('bookings_status_idx').on(table.status),
  ];
});

// ── BOOKING_ATTENDEES ─────────────────────────────────────────
export const bookingAttendees = sqliteTable('booking_attendees', {
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
export const recurringApprovals = sqliteTable('recurring_approvals', {
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  bookingId: text('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  adminId: text('adminId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approved: integer('approved', { mode: 'boolean' }).default(false).notNull(),
  votedAt: integer('votedAt', { mode: 'timestamp' }),
}, (table) => {
  return [
    unique('recurring_approvals_unique').on(table.bookingId, table.adminId),
    index('recurring_approvals_booking_idx').on(table.bookingId),
  ];
});

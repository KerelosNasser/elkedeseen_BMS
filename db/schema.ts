import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Enums (SQLite doesn't have native enums, so we'll use text)
export const roles = ['admin', 'user'] as const;
export const sections = ['ground_floor', 'second_floor', 'education_building'] as const;
export const statuses = ['active', 'pending_approval', 'rejected'] as const;

// ── USERS ─────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  role: text('role', { enum: roles }).default('user').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now') * 1000)`).notNull(),
});

// ── VENUES ────────────────────────────────────────────────────
export const venues = sqliteTable('venues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nameAr: text('nameAr').notNull(),
  section: text('section', { enum: sections }).notNull(),
  capacity: integer('capacity'),
  isDouble: integer('isDouble', { mode: 'boolean' }).default(false).notNull(),
  sortOrder: integer('sortOrder').notNull(),
});

// ── BOOKINGS ──────────────────────────────────────────────────
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  venueId: text('venueId').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  bookedBy: text('bookedBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  dayOfWeek: integer('dayOfWeek').notNull(), // smallint -> integer
  startTime: text('startTime').notNull(), // time -> text
  endTime: text('endTime').notNull(), // time -> text
  weekDate: text('weekDate').notNull(), // date -> text (YYYY-MM-DD)
  isRecurring: integer('isRecurring', { mode: 'boolean' }).default(false).notNull(),
  status: text('status', { enum: statuses }).default('active').notNull(),
  notes: text('notes'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now') * 1000)`).notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
});

// ── BOOKING_ATTENDEES ─────────────────────────────────────────
export const bookingAttendees = sqliteTable('booking_attendees', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return [
    unique('booking_attendees_unique').on(table.bookingId, table.userId)
  ];
});

// ── RECURRING_APPROVALS ───────────────────────────────────────
export const recurringApprovals = sqliteTable('recurring_approvals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookingId: text('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  adminId: text('adminId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approved: integer('approved', { mode: 'boolean' }).default(false).notNull(),
  votedAt: integer('votedAt', { mode: 'timestamp' }),
}, (table) => {
  return [
    unique('recurring_approvals_unique').on(table.bookingId, table.adminId)
  ];
});

// ── SESSIONS ──────────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now') * 1000)`).notNull(),
});

import { pgTable, uuid, varchar, text, pgEnum, boolean, integer, smallint, time, date, timestamp, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'user']);
export const sectionEnum = pgEnum('section', ['ground_floor', 'second_floor', 'education_building']);
export const statusEnum = pgEnum('status', ['active', 'pending_approval', 'rejected']);

// ── USERS ─────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// ── VENUES ────────────────────────────────────────────────────
export const venues = pgTable('venues', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameAr: varchar('nameAr', { length: 100 }).notNull(),
  section: sectionEnum('section').notNull(),
  capacity: integer('capacity'),
  isDouble: boolean('isDouble').default(false).notNull(),
  sortOrder: integer('sortOrder').notNull(),
});

// ── BOOKINGS ──────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  venueId: uuid('venueId').notNull().references(() => venues.id, { onDelete: 'cascade' }),
  bookedBy: uuid('bookedBy').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  dayOfWeek: smallint('dayOfWeek').notNull(),
  startTime: time('startTime').notNull(),
  endTime: time('endTime').notNull(),
  weekDate: date('weekDate').notNull(),
  isRecurring: boolean('isRecurring').default(false).notNull(),
  status: statusEnum('status').default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
});

// ── BOOKING_ATTENDEES ─────────────────────────────────────────
export const bookingAttendees = pgTable('booking_attendees', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => {
  return [
    unique('booking_attendees_unique').on(table.bookingId, table.userId)
  ];
});

// ── RECURRING_APPROVALS ───────────────────────────────────────
export const recurringApprovals = pgTable('recurring_approvals', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('bookingId').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  adminId: uuid('adminId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  approved: boolean('approved').default(false).notNull(),
  votedAt: timestamp('votedAt'),
}, (table) => {
  return [
    unique('recurring_approvals_unique').on(table.bookingId, table.adminId)
  ];
});

// ── SESSIONS ──────────────────────────────────────────────────
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

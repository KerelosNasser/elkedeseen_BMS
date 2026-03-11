# ✦ Church Booking Design System

Coptic church aesthetic UI system for Next.js + TailwindCSS + TypeScript.

## Setup

### 1. Install dependencies

```bash
npm install clsx tailwind-merge
```

### 2. Copy files into your project

```
tailwind.config.ts       → root
styles/globals.css       → app/globals.css or styles/globals.css
lib/tokens.ts            → lib/tokens.ts
lib/utils.ts             → lib/utils.ts
components/ui/           → components/ui/
components/booking/      → components/booking/
components/admin/        → components/admin/
```

### 3. Import global styles in layout

```tsx
// app/layout.tsx
import "@/styles/globals.css";
```

### 4. Add Google Fonts to `<head>` (or use `next/font`)

```tsx
// app/layout.tsx
import { Aref_Ruqaa, Amiri, Cairo } from "next/font/google";

const arefRuqaa = Aref_Ruqaa({ weight: ["400", "700"], subsets: ["arabic"] });
const amiri = Amiri({ weight: ["400", "700"], subsets: ["arabic"] });
const cairo = Cairo({ subsets: ["arabic", "latin"] });
```

---

## Design Tokens

| Token | Value | Use |
|-------|-------|-----|
| `church-red` | `#9B1C1F` | Primary brand, headings, buttons |
| `church-gold` | `#D4AF37` | Accents, dividers, borders |
| `church-gold-light` | `#E8D7A5` | Soft highlights, backgrounds |
| `church-bg` | `#F5EFE4` | Page background |
| `church-text` | `#2A2A2A` | Body text |
| Font: title | Aref Ruqaa | Arabic headings |
| Font: subtitle | Amiri | Subheadings, quotes |
| Font: body | Cairo | All body text, UI labels |

---

## Utility Classes

### Layout
```html
<div class="church-container">     <!-- max-w-6xl centered with padding -->
<section class="church-section">   <!-- vertical section padding -->
<div class="church-background">    <!-- full page warm gradient bg -->
```

### Borders & Shadows
```html
<div class="gold-border">          <!-- subtle gold border -->
<div class="gold-border-strong">   <!-- prominent gold border + glow -->
<div class="soft-shadow">          <!-- warm brown shadow -->
<div class="soft-shadow-md">       <!-- medium shadow -->
<div class="soft-shadow-lg">       <!-- large shadow -->
```

### Cards
```html
<div class="church-card">          <!-- base card -->
<div class="church-card-padded">   <!-- card + padding -->
```

### Typography
```html
<h1 class="section-title">        <!-- Arabic title, church-red -->
<h2 class="section-title-en">     <!-- English title, church-red -->
<p class="section-subtitle">      <!-- Amiri subtitle, muted -->
```

### Dividers
```html
<div class="gold-divider">                <!-- ornate with cross icon -->
<div class="gold-divider-simple">         <!-- simple gradient line -->
<div class="gold-divider variant=thick">  <!-- thick gold bar -->
```

### Buttons
```html
<button class="church-button church-button-primary">  <!-- red gradient -->
<button class="church-button church-button-gold">     <!-- gold gradient -->
<button class="church-button church-button-outline">  <!-- red outline -->
<button class="church-button church-button-ghost">    <!-- ghost -->
```

### Booking Slots
```html
<button class="booking-slot booking-slot-available">
<button class="booking-slot booking-slot-selected">
<button class="booking-slot booking-slot-booked">
<button class="booking-slot booking-slot-gold">
```

### Calendar
```html
<div class="calendar-day calendar-day-default">
<div class="calendar-day calendar-day-selected">
<div class="calendar-day calendar-day-today">
<div class="calendar-day calendar-day-disabled">
<div class="calendar-day calendar-day-has-slots">   <!-- gold dot indicator -->
```

### Form
```html
<input class="form-input">
<input class="form-input-error">
<label class="form-label">
<p class="form-error">
<p class="form-hint">
```

### Admin Table
```html
<table class="admin-table">
```

### Badges
```html
<span class="badge badge-confirmed">
<span class="badge badge-pending">
<span class="badge badge-cancelled">
```

---

## React Components

### Button
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md" loading={false}>حجز موعد</Button>
<Button variant="gold" iconLeft={<Icon />}>تأكيد</Button>
<Button variant="outline">إلغاء</Button>
```

**Props:** `variant?: "primary" | "gold" | "outline" | "ghost"` | `size?: "sm" | "md" | "lg"` | `loading?: boolean` | `iconLeft / iconRight: ReactNode`

---

### Card
```tsx
import Card, { CardHeader, CardBody, CardFooter } from "@/components/ui/Card";

<Card variant="elevated" padded>
  <CardHeader ornament="✦">
    <h3>عنوان البطاقة</h3>
  </CardHeader>
  <CardBody>محتوى</CardBody>
  <CardFooter><Button>إجراء</Button></CardFooter>
</Card>
```

**Props:** `variant?: "default" | "elevated" | "outlined"` | `padded?: boolean`

---

### BookingSlot
```tsx
import BookingSlot from "@/components/booking/BookingSlot";

<BookingSlot
  time="10:00"
  period="AM"
  label="الضحى"
  status="available"     // "available" | "selected" | "booked" | "gold"
  capacity={20}
  booked={5}
  onClick={() => selectSlot(id)}
/>
```

---

### CalendarGrid
```tsx
import { CalendarGrid } from "@/components/booking/Calendar";

<CalendarGrid
  month={new Date()}
  selectedDate={selectedDate}
  availableDates={availableDates}
  onSelectDate={(d) => setSelected(d)}
  minDate={new Date()}
/>
```

---

### DatePicker
```tsx
import { DatePicker } from "@/components/booking/Calendar";

<DatePicker
  value={date}
  onChange={setDate}
  availableDates={myDates}
  placeholder="اختر تاريخاً"
/>
```

---

### BookingForm
```tsx
import BookingForm from "@/components/booking/BookingForm";

<BookingForm
  slots={mySlots}
  serviceTypes={["القداس", "الاجتماع"]}
  availableDates={myDates}
  onSubmit={async (data) => {
    await createBooking(data);
  }}
/>
```

---

### AdminBookingTable
```tsx
import AdminBookingTable from "@/components/admin/AdminBookingTable";

<AdminBookingTable
  bookings={bookings}
  onStatusChange={(id, status) => updateStatus(id, status)}
  onDelete={(id) => deleteBooking(id)}
/>
```

---

## RTL Support

All components use `dir="rtl"` internally for Arabic text. The design system is RTL-first.
Add `dir="rtl"` to your `<html>` tag for full page RTL:

```tsx
// app/layout.tsx
<html lang="ar" dir="rtl">
```
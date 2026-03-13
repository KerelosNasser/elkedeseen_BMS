# ✦ Elkedeseen BMS: Spiritual Architecture meets Enterprise Engineering

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v0.45-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon_DB-Serverless_Postgres-00E599?style=for-the-badge&logo=neon)](https://neon.tech/)

**Elkedeseen BMS** is a high-fidelity, RTL-first Booking Management System designed specifically for the unique needs of Coptic church communities. It marries centuries-old spiritual aesthetics with cutting-edge web technologies to provide a seamless, ornate, and powerful management experience.

![Elkedeseen Hero Image](./church_bms_hero.png)

---

## ✨ The Vision

We didn't just build a booking app; we built a digital cathedral. Every pixel is infused with a "Coptic Aesthetic" — deep liturgical reds, refined golden accents, and parchment-inspired backgrounds. It's a system that feels familiar to the spirit but powerful to the administrator.

### 🏛️ 5 Core Pillars

- **Venue Command**: Manage sacred spaces with capacity awareness and architectural mapping.
- **Ornate Scheduling**: High-performance calendar systems supporting recurring spiritual services.
- **Admin Consensus**: A multi-admin approval workflow for recurring events to ensure liturgical harmony.
- **Smart Notifications**: Intelligent emailing system that mimics personal outreach while staying automated.
- **RTL-First Precision**: Built from the ground up for Arabic, ensuring perfect typography and layout flow.

---

## 🛠️ The Tech Stack

Built for scale, speed, and standardizing the "Vibe Coding" paradigm.

- **Framework**: [Next.js 16](https://next.js.org) (App Router, Server Actions, Turbopack)
- **Database**: [Neon DB](https://neon.tech) (Serverless Postgres) with [Drizzle ORM](https://orm.drizzle.team)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (Modern, high-performance styling)
- **Animations**: [GSAP](https://gsap.com) (Fluid transitions and scroll-triggered elegance)
- **Messaging**: [Nodemailer](https://nodemailer.com) (Customized with dynamic sender identities)
- **Validation**: [Zod](https://zod.dev) (Strict schema enforcement)

---

## 🎨 Design System: "Sacred Aesthetic"

Our design system is baked into the DNA of the project. We use a curated palette and custom tokens to maintain visual divinity:

| Token              | Value     | Purpose                            |
| :----------------- | :-------- | :--------------------------------- |
| **Church Red**     | `#9B1C1F` | Dignity, headings, primary actions |
| **Church Gold**    | `#D4AF37` | Radiance, borders, ornaments       |
| **Church BG**      | `#F5EFE4` | Serenity, page backgrounds         |
| **Ornate Divider** | Ornate ✦  | Sacred separation of content       |

---

## 🚀 Getting Started

Ensure you have the digital keys before entering the sanctuary.

### 1. Environment Secrets

Create a `.env.local` file with the following:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
ADMIN_EMAILS=admin@example.com

# SMTP (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM="System" <noreply@example.com>
```

### 2. Ritual Installation

```bash
pnpm install
pnpm dev
```

The sanctuary will be available at `http://localhost:3000`.

---

## 🔥 Features that Stand Out

### 📧 The Smart Emailer

Our notification system doesn't feel like a bot. It uses the **Identity** of the admin who makes a booking to send the email, setting the `from` display name and `reply-to` headers automatically. This ensures that when an admin receives a notification, they can simply hit "Reply" to talk to the booker.

### 🗓️ Recurring Logic

Handles complex recurring patterns with mandatory admin consensus. It tracks every vote and only activates the booking when the council of admins agrees.

---

## 🤝 Contribution

This project is a labor of love for the community. If you have ideas to enhance the digital sanctuary, feel free to open a PR.

---

<p align="center">
  Built with ❤️ for the Elkedeseen Community. <br/>
  <i>"Architecture is the art of how to waste space." — Except in our UI.</i>
</p>


export const colors = {
  red: "#9B1C1F",
  redDark: "#7A1518",
  redLight: "#C0282C",
  gold: "#D4AF37",
  goldLight: "#E8D7A5",
  goldDark: "#B8952E",
  goldMuted: "#C9B96A",
  bg: "#F5EFE4",
  bgWarm: "#EDE4D3",
  bgCard: "#FAF6EF",
  text: "#2A2A2A",
  textMuted: "#6B5E4E",
  textLight: "#9C8E7E",
  border: "#D9C9A8",
  borderLight: "#EDE0C4",
} as const;

export const fonts = {
  title: "'Aref Ruqaa', Georgia, serif",
  subtitle: "'Amiri', Georgia, serif",
  body: "'Cairo', sans-serif",
} as const;

export const borderRadius = {
  card: "1rem",
  cardLg: "1.5rem",
  slot: "0.625rem",
  pill: "9999px",
} as const;

export const shadows = {
  church: "0 4px 24px rgba(42, 26, 10, 0.10), 0 1px 4px rgba(42, 26, 10, 0.06)",
  churchMd: "0 8px 40px rgba(42, 26, 10, 0.13), 0 2px 8px rgba(42, 26, 10, 0.07)",
  churchLg: "0 16px 64px rgba(42, 26, 10, 0.18), 0 4px 16px rgba(42, 26, 10, 0.08)",
  gold: "0 0 0 2px #D4AF37, 0 4px 20px rgba(212, 175, 55, 0.25)",
  slot: "0 2px 12px rgba(42, 26, 10, 0.08)",
  slotHover: "0 6px 24px rgba(155, 28, 31, 0.15)",
} as const;

export const gradients = {
  churchBg: "linear-gradient(160deg, #F5EFE4 0%, #EDE4D3 50%, #E8D7C0 100%)",
  gold: "linear-gradient(135deg, #D4AF37 0%, #E8D7A5 50%, #D4AF37 100%)",
  red: "linear-gradient(135deg, #9B1C1F 0%, #C0282C 100%)",
  card: "linear-gradient(160deg, #FAF6EF 0%, #F2EAD8 100%)",
} as const;

// Booking slot status variants
export const slotVariants = {
  available: "booking-slot-available",
  selected: "booking-slot-selected",
  booked: "booking-slot-booked",
  gold: "booking-slot-gold",
} as const;

export type SlotVariant = keyof typeof slotVariants;

// Button variants
export const buttonVariants = {
  primary: "church-button-primary",
  gold: "church-button-gold",
  outline: "church-button-outline",
  ghost: "church-button-ghost",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
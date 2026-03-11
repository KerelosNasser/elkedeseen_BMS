import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          red: "#9B1C1F",
          "red-dark": "#7A1518",
          "red-light": "#C0282C",
          gold: "#D4AF37",
          "gold-light": "#E8D7A5",
          "gold-dark": "#B8952E",
          "gold-muted": "#C9B96A",
          bg: "#F5EFE4",
          "bg-warm": "#EDE4D3",
          "bg-card": "#FAF6EF",
          text: "#2A2A2A",
          "text-muted": "#6B5E4E",
          "text-light": "#9C8E7E",
          border: "#D9C9A8",
          "border-light": "#EDE0C4",
        },
      },
      fontFamily: {
        title: ["Aref Ruqaa", "Georgia", "serif"],
        subtitle: ["Amiri", "Georgia", "serif"],
        body: ["Cairo", "sans-serif"],
      },
      fontSize: {
        "display-ar": ["clamp(2.5rem, 6vw, 4.5rem)", { lineHeight: "1.2", fontWeight: "700" }],
        "h1-ar": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.3", fontWeight: "700" }],
        "h2-ar": ["clamp(1.5rem, 3vw, 2.25rem)", { lineHeight: "1.4", fontWeight: "600" }],
        "h3-ar": ["clamp(1.25rem, 2.5vw, 1.75rem)", { lineHeight: "1.5", fontWeight: "600" }],
      },
      borderRadius: {
        card: "1rem",
        "card-lg": "1.5rem",
        slot: "0.625rem",
        pill: "9999px",
      },
      boxShadow: {
        church: "0 4px 24px rgba(42, 26, 10, 0.10), 0 1px 4px rgba(42, 26, 10, 0.06)",
        "church-md": "0 8px 40px rgba(42, 26, 10, 0.13), 0 2px 8px rgba(42, 26, 10, 0.07)",
        "church-lg": "0 16px 64px rgba(42, 26, 10, 0.18), 0 4px 16px rgba(42, 26, 10, 0.08)",
        gold: "0 0 0 2px #D4AF37, 0 4px 20px rgba(212, 175, 55, 0.25)",
        "gold-inset": "inset 0 1px 0 rgba(212, 175, 55, 0.4)",
        slot: "0 2px 12px rgba(42, 26, 10, 0.08)",
        "slot-hover": "0 6px 24px rgba(155, 28, 31, 0.15)",
      },
      backgroundImage: {
        "church-gradient": "linear-gradient(160deg, #F5EFE4 0%, #EDE4D3 50%, #E8D7C0 100%)",
        "church-gradient-radial": "radial-gradient(ellipse at 60% 20%, #F0E6D2 0%, #E8D7C0 60%, #DDD0B8 100%)",
        "gold-gradient": "linear-gradient(135deg, #D4AF37 0%, #E8D7A5 50%, #D4AF37 100%)",
        "gold-shimmer": "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.4) 50%, transparent 100%)",
        "red-gradient": "linear-gradient(135deg, #9B1C1F 0%, #C0282C 100%)",
        "card-gradient": "linear-gradient(160deg, #FAF6EF 0%, #F2EAD8 100%)",
        "header-gradient": "linear-gradient(180deg, rgba(155,28,31,0.97) 0%, rgba(122,21,24,1) 100%)",
      },
      spacing: {
        section: "5rem",
        "section-sm": "3rem",
        container: "1.5rem",
      },
      animation: {
        shimmer: "shimmer 2.5s infinite linear",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "gold-pulse": "goldPulse 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,175,55,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(212,175,55,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

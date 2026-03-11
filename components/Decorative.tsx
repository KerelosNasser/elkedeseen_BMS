import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ── GoldDivider ──────────────────────────────────────────────

interface GoldDividerProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  variant?: "ornate" | "simple" | "thick";
}

export const GoldDivider = ({
  icon,
  variant = "ornate",
  className,
  ...props
}: GoldDividerProps) => {
  if (variant === "simple") {
    return <div className={cn("gold-divider-simple", className)} {...props} />;
  }

  if (variant === "thick") {
    return (
      <div className={cn("w-24 h-1 mx-auto rounded-full", className)} style={{
        background: "linear-gradient(90deg, #B8952E, #D4AF37, #E8D7A5, #D4AF37, #B8952E)"
      }} {...props} />
    );
  }

  return (
    <div className={cn("gold-divider", className)} {...props}>
      <span className="gold-divider-icon">
        {icon ?? <CrossOrnament />}
      </span>
    </div>
  );
};

// Decorative Coptic cross SVG
const CrossOrnament = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-church-gold">
    <circle cx="10" cy="10" r="2.5" fill="currentColor" />
    <rect x="9" y="1" width="2" height="18" rx="1" fill="currentColor" />
    <rect x="1" y="9" width="18" height="2" rx="1" fill="currentColor" />
    <circle cx="10" cy="1.5" r="1.5" fill="currentColor" />
    <circle cx="10" cy="18.5" r="1.5" fill="currentColor" />
    <circle cx="1.5" cy="10" r="1.5" fill="currentColor" />
    <circle cx="18.5" cy="10" r="1.5" fill="currentColor" />
  </svg>
);

// ── SectionTitle ─────────────────────────────────────────────

interface SectionTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  arabicTitle?: string;
  align?: "center" | "right" | "left";
  showDivider?: boolean;
}

export const SectionTitle = ({
  title,
  subtitle,
  arabicTitle,
  align = "center",
  showDivider = true,
  className,
  ...props
}: SectionTitleProps) => {
  const alignClass = {
    center: "text-center items-center",
    right: "text-right items-end",
    left: "text-left items-start",
  }[align];

  return (
    <div className={cn("flex flex-col gap-3", alignClass, className)} {...props}>
      {arabicTitle && (
        <h2 className="section-title">{arabicTitle}</h2>
      )}
      <h2 className={cn("section-title-en", arabicTitle && "text-xl sm:text-2xl text-church-text-muted")}>
        {title}
      </h2>
      {showDivider && (
        <GoldDivider className={align !== "center" ? "justify-start" : ""} />
      )}
      {subtitle && (
        <p className="font-subtitle text-base sm:text-lg text-church-text-muted max-w-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
};
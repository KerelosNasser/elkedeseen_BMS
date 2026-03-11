import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padded?: boolean;
}

const variantClasses = {
  default: "church-card",
  elevated: "church-card soft-shadow-md",
  outlined: "church-card gold-border-strong",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padded = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          padded && "p-6 sm:p-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// ── Card sub-components ──────────────────────────────────────

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ornament?: string;
}

export const CardHeader = ({ ornament, className, children, ...props }: CardHeaderProps) => (
  <div className={cn("px-6 pt-6 sm:px-8 sm:pt-8", className)} {...props}>
    {ornament && <p className="church-ornament mb-2">{ornament}</p>}
    {children}
    <div className="gold-divider-simple mt-4" />
  </div>
);

export const CardBody = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 pb-6 sm:px-8 sm:pb-8 pt-4", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-church-border-light flex items-center gap-3",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Card;
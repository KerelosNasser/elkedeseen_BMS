"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { SlotVariant } from "@/lib/tokens";
import { slotVariants } from "@/lib/tokens";

interface BookingSlotProps extends HTMLAttributes<HTMLButtonElement> {
  time: string;
  period?: "AM" | "PM";
  label?: string;
  status?: SlotVariant;
  capacity?: number;
  booked?: number;
  disabled?: boolean;
}

const BookingSlot = ({
  time,
  period,
  label,
  status = "available",
  capacity,
  booked = 0,
  disabled,
  className,
  onClick,
  ...props
}: BookingSlotProps) => {
  const isBooked = status === "booked" || disabled;

  return (
    <button
      disabled={isBooked}
      onClick={isBooked ? undefined : onClick}
      className={cn(slotVariants[status], "min-w-[80px]", className)}
      aria-label={`Booking slot ${time}${period ? " " + period : ""}${isBooked ? " - fully booked" : ""}`}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      <span className="font-semibold text-base leading-none">
        {time}
        {period && <span className="text-xs font-normal ml-0.5 opacity-80">{period}</span>}
      </span>
      {label && (
        <span className="text-xs opacity-75 leading-none">{label}</span>
      )}
      {capacity !== undefined && (
        <span className="text-[10px] opacity-60 leading-none mt-0.5">
          {isBooked ? "مكتمل" : `${capacity - booked} متاح`}
        </span>
      )}
    </button>
  );
};

export default BookingSlot;
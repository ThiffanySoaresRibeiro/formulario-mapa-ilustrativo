import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { variant?: "default" | "form" }>(
  ({ className, type, variant = "form", ...props }, ref) => {
    const base =
      variant === "form"
        ? "flex h-32 w-full rounded-md border border-amber-200 bg-background px-3 py-4 text-base align-top placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        : "flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    return (
      <input
        type={type}
        className={cn(base, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input"

export { Input }

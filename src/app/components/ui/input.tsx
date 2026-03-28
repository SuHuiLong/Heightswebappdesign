import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-input-background px-3 py-1 text-base shadow-[var(--shadow-xs)] transition-[background-color,border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--disabled-border)] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] md:text-sm",
        "hover:border-[color:var(--border-strong)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

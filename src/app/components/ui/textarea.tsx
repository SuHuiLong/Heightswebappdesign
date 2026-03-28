import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base shadow-[var(--shadow-xs)] transition-[background-color,border-color,box-shadow] outline-none hover:border-[color:var(--border-strong)] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:border-[var(--disabled-border)] disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

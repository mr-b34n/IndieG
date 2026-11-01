import * as React from "react";
import { cn } from "@/shared/utils/cn";
import { Switch as SwitchPrimitive } from "radix-ui";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border/80 transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        "data-[state=checked]:bg-primary data-[state=checked]:border-transparent data-[state=unchecked]:bg-surface-hover",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          size === "sm"
            ? "size-4 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
            : "size-5 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

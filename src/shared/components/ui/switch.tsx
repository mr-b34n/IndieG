import * as React from "react";
import { cn } from "@/shared/utils/cn";

export interface SwitchProps extends Omit<React.ComponentProps<"button">, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: "sm" | "default";
}

function Switch({
  className,
  size = "default",
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;
  const state = isChecked ? "checked" : "unchecked";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setUncontrolledChecked(next);
    }
    onCheckedChange?.(next);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={state}
      data-slot="switch"
      data-size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border/80 transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        "data-[state=checked]:bg-primary data-[state=checked]:border-transparent data-[state=unchecked]:bg-surface-hover",
        className
      )}
      {...props}
    >
      <span
        data-state={state}
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          size === "sm"
            ? "size-4 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]"
            : "size-5 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </button>
  );
}

export { Switch };

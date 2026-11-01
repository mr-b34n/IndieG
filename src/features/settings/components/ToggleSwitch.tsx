import { Switch } from '@/shared/components/ui/switch';
import type { ToggleSwitchProps } from '../types';

export function ToggleSwitch({
    checked,
    onChange,
    disabled,
    ariaLabel,
}: ToggleSwitchProps) {
    return (
        <Switch
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-label={ariaLabel}
        />
    );
}

import type { ComponentType, CSSProperties, MouseEventHandler } from "react";
import type { IconWeight } from "@phosphor-icons/react";

export type AppIconComponent = ComponentType<{
    size?: string | number;
    className?: string;
    weight?: IconWeight;
    style?: CSSProperties;
    "aria-hidden"?: boolean;
}>;

export interface AppIconProps {
    icon: AppIconComponent;
    className?: string;
    spin?: boolean;
    fixedWidth?: boolean;
    size?: string | number;
    weight?: IconWeight;
    style?: CSSProperties;
    title?: string;
    onClick?: MouseEventHandler<SVGSVGElement>;
}

/**
 * Lightweight Phosphor solid icon wrapper matching 1em sizing semantics.
 * Keeps individual icons 100% tree-shakable while supporting dynamic `icon` props.
 */
export function AppIcon({
    icon: Icon,
    className = "",
    spin = false,
    fixedWidth: _fixedWidth,
    size = "1em",
    weight = "fill",
    style,
    ...rest
}: AppIconProps) {
    const classes = [
        "inline-block shrink-0 align-[-0.125em]",
        spin ? "animate-spin" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Icon
            size={size}
            weight={weight}
            className={classes}
            style={style}
            aria-hidden={true}
            {...rest}
        />
    );
}

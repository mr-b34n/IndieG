import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useRef, useEffect } from "react"

export const Search = () => {
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Shortcut "/" to focus
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    return (
        <div className="relative w-full max-w-md">

            <div className={`
                flex flex-row items-center gap-2.5 px-3.5 py-2.5
                w-full
                bg-surface/90 backdrop-blur-md
                border-2 rounded-full
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                dark:shadow-[0_2px_14px_rgba(0,0,0,0.28)]
                transition-all duration-200
                ${focused
                    ? "border-primary shadow-[0_4px_20px_rgba(124,77,255,0.18)]"
                    : "border-border hover:border-neutral-300 dark:hover:border-neutral-700"}
            `}>
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className={`text-sm shrink-0 transition-colors duration-150
                        ${focused ? "text-primary" : "text-text-faint"}`}
                />

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Tìm game, bài viết, hoặc squad..."
                    className="w-full focus:outline-none bg-transparent
                        text-sm text-text placeholder:text-text-faint"
                />

                {!focused && !value && (
                    <kbd className="hidden sm:flex shrink-0 items-center justify-center
                        px-1.5 py-0.5 rounded-md
                        text-[10px] font-medium text-text-faint
                        border border-border bg-surface-hover">
                        /
                    </kbd>
                )}

                {value && (
                    <button
                        onClick={() => setValue("")}
                        className="shrink-0 w-5 h-5 flex items-center justify-center
                            rounded-full text-text-faint
                            hover:text-text hover:bg-surface-hover
                            transition-colors text-xs"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
            </div>

            {focused && (
                <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="
                        absolute top-full left-0 mt-2 w-full z-30
                        bg-surface/95 backdrop-blur-md
                        border border-border
                        rounded-2xl overflow-hidden
                        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
                        dark:shadow-[0_8px_36px_rgba(0,0,0,0.45)]
                    "
                >
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase
                        tracking-widest text-text-faint">
                        Tìm kiếm gần đây
                    </p>
                    <div className="flex flex-col pb-2">
                        {["CS 2 update patch", "RDR2 mods", "Raft co-op tips"].map((item) => (
                            <button
                                key={item}
                                onClick={() => setValue(item)}
                                className="flex flex-row items-center gap-2.5 px-4 py-2
                                    text-sm text-left
                                    hover:bg-surface-hover
                                    transition-colors duration-150"
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="text-xs text-text-faint shrink-0"
                                />
                                <p className="text-text-muted">{item}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
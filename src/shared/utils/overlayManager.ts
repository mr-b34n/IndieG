import { useEffect } from "react";

export interface OverlayEntry {
    id: string;
    close: () => boolean | void;
    priority?: number;
    createdAt: number;
}

class OverlayManager {
    private stack: OverlayEntry[] = [];

    register(entry: OverlayEntry): () => void {
        this.stack = this.stack.filter((item) => item.id !== entry.id);
        this.stack.push(entry);
        return () => this.unregister(entry.id);
    }

    unregister(id: string): void {
        this.stack = this.stack.filter((item) => item.id !== id);
    }

    hasOpenOverlays(): boolean {
        return this.stack.length > 0;
    }

    getTopOverlay(): OverlayEntry | undefined {
        if (this.stack.length === 0) return undefined;
        const sorted = [...this.stack].sort((a, b) => {
            const pA = a.priority ?? 0;
            const pB = b.priority ?? 0;
            if (pB !== pA) return pB - pA;
            return b.createdAt - a.createdAt;
        });
        return sorted[0];
    }

    handleEscape(): boolean {
        const top = this.getTopOverlay();
        if (!top) return false;
        
        this.unregister(top.id);
        const result = top.close();
        if (result === false) {
            return false;
        }
        return true;
    }
}

export const overlayManager = new OverlayManager();

export function useRegisterOverlay({
    id,
    isOpen,
    onClose,
    priority = 10,
}: {
    id: string;
    isOpen: boolean;
    onClose: () => boolean | void;
    priority?: number;
}) {
    useEffect(() => {
        if (!isOpen) {
            overlayManager.unregister(id);
            return;
        }
        return overlayManager.register({
            id,
            close: onClose,
            priority,
            createdAt: Date.now(),
        });
    }, [id, isOpen, onClose, priority]);
}

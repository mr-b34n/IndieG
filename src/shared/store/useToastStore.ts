import { create } from "zustand";

export interface ToastItem {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    duration?: number;
}

interface ToastState {
    toasts: ToastItem[];
    addToast: (toast: Omit<ToastItem, "id">) => string;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const duration = toast.duration ?? (toast.type === "error" ? 4500 : 3000);

        set((state) => ({
            toasts: [...state.toasts, { ...toast, id, duration }],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((t) => t.id !== id),
                }));
            }, duration);
        }

        return id;
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}));

export const toast = {
    success: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: "success", message, duration }),
    error: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: "error", message, duration }),
    info: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: "info", message, duration }),
    warning: (message: string, duration?: number) =>
        useToastStore.getState().addToast({ type: "warning", message, duration }),
};

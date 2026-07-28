import { supabase } from "@/shared/lib/supabaseClient";
import { type Session, type AuthChangeEvent } from "@supabase/supabase-js";
import { create } from "zustand";
import { type AuthState } from "../types";

export * from "../types";

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    mockLogin: false,
    customAvatar: typeof window !== "undefined" ? localStorage.getItem("user_custom_avatar") : null,

    setCustomAvatar: (avatar) => {
        if (typeof window !== "undefined") {
            if (avatar) {
                localStorage.setItem("user_custom_avatar", avatar);
            } else {
                localStorage.removeItem("user_custom_avatar");
            }
        }
        set({ customAvatar: avatar });
    },

    initializeAuth: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ user: session?.user ?? null, loading: false })
        }).catch(() => {
            set({ user: null, loading: false });
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            set({ user: session?.user ?? null, loading: false });
        });

        return () => subscription?.unsubscribe?.();
    },

    toggleMockLogin: () => set((state) => ({ mockLogin: !state.mockLogin }))
}))
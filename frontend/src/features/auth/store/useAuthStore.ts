import { supabase } from "@/shared/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { type Session, type AuthChangeEvent } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
    user: User | null,
    loading: boolean,
    mockLogin: boolean,
    initializeAuth: () => () => void,
    toggleMockLogin: () => void,
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    mockLogin: false,

    initializeAuth: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ user: session?.user ?? null, loading: false })
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            set({ user: session?.user ?? null, loading: false });
        });

        return () => subscription.unsubscribe();
    },

    toggleMockLogin: () => set((state) => ({ mockLogin: !state.mockLogin }))
}))
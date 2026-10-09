import { useNavigate, useLocation } from "@tanstack/react-router";
import { useHotkeys, useSequenceHotkeys } from "./useHotkeys";
import { useShortcutsStore } from "../store/useShortcutsStore";
import { useThemeStore } from "../store/useThemeStore";
import { useCreatePostModalStore } from "@/features/feed/store/useCreatePostModalStore";
import { useNotificationStore } from "@/features/notification/store/useNotificationStore";
import { useFeedNavigationStore } from "@/features/post/store/useFeedNavigationStore";
import { overlayManager } from "../utils/overlayManager";

export function useGlobalShortcuts() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // 1. Cheatsheet modal: \
    useHotkeys(["\\"], (e) => {
        e.preventDefault();
        useShortcutsStore.getState().toggleCheatsheet();
    });

    // 2. Quick Search: /
    useHotkeys(["/"], (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input") as HTMLInputElement | null;
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    });

    // 3. Create Post: Mod + K
    useHotkeys(["Mod", "k"], (e) => {
        e.preventDefault();
        let targetCommId: string | undefined;
        if (pathname.startsWith("/community/")) {
            const parts = pathname.split("/");
            if (parts[2]) targetCommId = parts[2];
        }
        useCreatePostModalStore.getState().openCreatePost(targetCommId);
    }, { ignoreInput: false });

    // 4. Toggle Dark/Light Theme: T
    useHotkeys(["t"], () => {
        useThemeStore.getState().toggleTheme();
    });

    // 5. Toggle Language: L
    useHotkeys(["l"], () => {
        useThemeStore.getState().toggleLanguage();
    });

    // 6. Mark all notifications as read: Shift + M
    useHotkeys(["Shift", "m"], () => {
        useNotificationStore.getState().markAllAsRead();
    });

    // 7. Global Esc Handler: LIFO overlay stack manager
    useHotkeys(["Escape"], (e) => {
        const handled = overlayManager.handleEscape();
        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { ignoreInput: false });

    // 8. Go-To sequences: G then [F, C, S, G, E, P, B, N, A]
    useSequenceHotkeys("g", {
        f: () => {
            navigate({ to: "/" });
        },
        c: () => {
            navigate({ to: "/community" });
        },
        s: () => {
            navigate({ to: "/squad" });
        },
        g: () => {
            navigate({ to: "/game" });
        },
        e: () => {
            navigate({ to: "/explore" });
        },
        p: () => {
            navigate({ to: "/profile/$userId", params: { userId: "me" } });
        },
        b: () => {
            navigate({ to: "/bookmark" });
        },
        n: () => {
            useNotificationStore.getState().toggleOpen?.();
        },
        a: () => {
            navigate({ to: "/settings", search: { tab: "account" } });
        },
    }, 600);

    // 9. Feed & Post keyboard shortcuts:
    // J / K : Next / Prev post
    useHotkeys(["j"], () => {
        useFeedNavigationStore.getState().focusNext();
    });
    useHotkeys(["k"], () => {
        useFeedNavigationStore.getState().focusPrev();
    });

    // A / Z or ArrowUp / ArrowDown: Upvote / Downvote focused post
    useHotkeys(["a"], () => {
        useFeedNavigationStore.getState().triggerUpvote();
    });
    useHotkeys(["ArrowUp"], () => {
        useFeedNavigationStore.getState().triggerUpvote();
    });

    useHotkeys(["z"], () => {
        useFeedNavigationStore.getState().triggerDownvote();
    });
    useHotkeys(["ArrowDown"], () => {
        useFeedNavigationStore.getState().triggerDownvote();
    });

    // P: Pin / Unpin focused post (if author or admin)
    useHotkeys(["p"], () => {
        useFeedNavigationStore.getState().triggerPin();
    });

    // B: Bookmark focused post
    useHotkeys(["b"], () => {
        useFeedNavigationStore.getState().triggerBookmark();
    });
}

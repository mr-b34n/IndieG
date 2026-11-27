import { QueryClient, MutationCache } from "@tanstack/react-query";
import { toast } from "@/shared/store/useToastStore";

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            const meta = mutation.meta as { suppressGlobalToast?: boolean } | undefined;
            if (meta?.suppressGlobalToast) return;

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : typeof error === "string"
                    ? error
                    : "Đã xảy ra lỗi khi thực hiện thao tác. Vui lòng thử lại.";

            toast.error(errorMessage);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes fresh time
            gcTime: 1000 * 60 * 8, // 8 minutes in-memory cache retention (prevents long-session RAM bloat)
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 503) {
                    return false;
                }
                return failureCount < 1;
            },
        },
    },
});

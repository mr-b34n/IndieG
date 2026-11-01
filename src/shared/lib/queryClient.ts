import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
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

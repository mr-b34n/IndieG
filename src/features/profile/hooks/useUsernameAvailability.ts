import { useMemo } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useCheckUsernameQuery } from "@/shared/api/useQueries";
import { useTranslation } from "@/shared/hooks/useTranslate";

export type UsernameStatus =
    | "idle"
    | "current"
    | "invalid"
    | "checking"
    | "available"
    | "taken"
    | "error";

export interface UseUsernameAvailabilityOptions {
    username: string;
    currentUsername?: string;
    enabled?: boolean;
}

export interface UseUsernameAvailabilityResult {
    status: UsernameStatus;
    cleanUsername: string;
    isChecking: boolean;
    isAvailable: boolean;
    isTaken: boolean;
    isValid: boolean;
    isCurrent: boolean;
    message: string;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export function useUsernameAvailability({
    username,
    currentUsername,
    enabled = true,
}: UseUsernameAvailabilityOptions): UseUsernameAvailabilityResult {
    const { t } = useTranslation();

    const cleanUsername = useMemo(
        () => (username || "").trim().replace(/^@+/, ""),
        [username]
    );

    const cleanCurrent = useMemo(
        () => (currentUsername || "").trim().replace(/^@+/, ""),
        [currentUsername]
    );

    const isCurrent = Boolean(
        cleanCurrent && cleanUsername.toLowerCase() === cleanCurrent.toLowerCase()
    );

    const validation = useMemo(() => {
        if (!cleanUsername) {
            return { isValid: false, message: "" };
        }
        if (cleanUsername.length < 3) {
            return {
                isValid: false,
                message: t("profile.usernameTooShort", { defaultValue: "Tối thiểu 3 ký tự" }),
            };
        }
        if (cleanUsername.length > 16) {
            return {
                isValid: false,
                message: t("profile.usernameTooLong", { defaultValue: "Tối đa 16 ký tự" }),
            };
        }
        if (!USERNAME_REGEX.test(cleanUsername)) {
            return {
                isValid: false,
                message: t("profile.usernameInvalidChars", { defaultValue: "Chỉ gồm chữ, số và dấu gạch dưới (_)" }),
            };
        }
        return { isValid: true, message: "" };
    }, [cleanUsername, t]);

    const debouncedClean = useDebounce(cleanUsername, 350);

    const shouldQuery = Boolean(
        enabled &&
        cleanUsername &&
        !isCurrent &&
        validation.isValid &&
        debouncedClean === cleanUsername
    );

    const isDebouncing = Boolean(
        enabled &&
        cleanUsername &&
        !isCurrent &&
        validation.isValid &&
        debouncedClean !== cleanUsername
    );

    const query = useCheckUsernameQuery(debouncedClean, shouldQuery);

    const result = useMemo((): UseUsernameAvailabilityResult => {
        if (!enabled || !cleanUsername) {
            return {
                status: "idle",
                cleanUsername,
                isChecking: false,
                isAvailable: false,
                isTaken: false,
                isValid: false,
                isCurrent: false,
                message: "",
            };
        }

        if (isCurrent) {
            return {
                status: "current",
                cleanUsername,
                isChecking: false,
                isAvailable: true,
                isTaken: false,
                isValid: true,
                isCurrent: true,
                message: t("profile.usernameCurrent", { defaultValue: "Username hiện tại của bạn" }),
            };
        }

        if (!validation.isValid) {
            return {
                status: "invalid",
                cleanUsername,
                isChecking: false,
                isAvailable: false,
                isTaken: false,
                isValid: false,
                isCurrent: false,
                message: validation.message,
            };
        }

        if (isDebouncing || query.isLoading || query.isFetching) {
            return {
                status: "checking",
                cleanUsername,
                isChecking: true,
                isAvailable: false,
                isTaken: false,
                isValid: true,
                isCurrent: false,
                message: t("profile.usernameChecking", { defaultValue: "Đang kiểm tra..." }),
            };
        }

        if (query.isError) {
            return {
                status: "error",
                cleanUsername,
                isChecking: false,
                isAvailable: false,
                isTaken: false,
                isValid: true,
                isCurrent: false,
                message: t("profile.usernameCheckError", { defaultValue: "Không thể kiểm tra username" }),
            };
        }

        if (query.data) {
            const exists = query.data.exists;
            return {
                status: exists ? "taken" : "available",
                cleanUsername,
                isChecking: false,
                isAvailable: !exists,
                isTaken: exists,
                isValid: true,
                isCurrent: false,
                message: exists
                    ? t("profile.usernameTaken", { defaultValue: "Username này đã có người sử dụng" })
                    : t("profile.usernameAvailable", { defaultValue: "Username khả dụng" }),
            };
        }

        return {
            status: "idle",
            cleanUsername,
            isChecking: false,
            isAvailable: false,
            isTaken: false,
            isValid: true,
            isCurrent: false,
            message: "",
        };
    }, [
        enabled,
        cleanUsername,
        isCurrent,
        validation,
        isDebouncing,
        query.isLoading,
        query.isFetching,
        query.isError,
        query.data,
        t,
    ]);

    return result;
}

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { usePostsStore, getCurrentAuthor } from "@/features/post";
import { getRankLabel, getRankConfigIfPresent } from "@/features/post/helpers/userRanks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faExclamationTriangle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { ImageCropperModal } from "./ImageCropperModal";
import { ProfileHero } from "./ProfileHero";
import { ProfileTabBar } from "./ProfileTabBar";

import {
    DEFAULT_COVER,
    COMMUNITY_REPUTATIONS, RECENT_ACTIVITIES,
} from "../constants";
import type { FriendEntry, FriendRequest, ProfileTab, ProfileIdentity, GuestbookComment } from "../types";
import { useProfileIdentity } from "../hooks/useProfileIdentity";
import { OverviewTab } from "./tabs/OverviewTab";
import { GamesTab } from "./tabs/GamesTab";
import { CommunitiesTab } from "./tabs/CommunitiesTab";
import { PostsTab } from "./tabs/PostsTab";
import { FriendsTab } from "./tabs/FriendsTab";
import { GuestbookTab } from "./tabs/GuestbookTab";
import { BookmarkList } from "@/features/bookmark";
import { useQueryClient } from "@tanstack/react-query";
import {
    useMyProfileQuery,
    useUserProfileQuery,
    useUpdateProfileMutation,
    useGuestbookCommentsQuery,
    useCreateGuestbookCommentMutation,
    useDeleteGuestbookCommentMutation,
    useLibraryGamesQuery,
    useCreateLibraryGameMutation,
    useDeleteLibraryGameMutation,
    useFriendsQuery,
    useIncomingFriendRequestsQuery,
    useOutgoingFriendRequestsQuery,
    useBlockedUsersQuery,
    useSendFriendRequestMutation,
    useAcceptFriendRequestMutation,
    useCancelFriendRequestMutation,
    useUnfriendMutation,
    useBlockUserMutation,
    useUnblockUserMutation,
} from "@/shared/api/useQueries";
import type { UpdateProfileDto } from "@/shared/api/types";
import { uploadImageToR2 } from "@/shared/services/upload-service";
import { extractFriendEntry, extractFriendRequest } from "../utils";

function dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

interface UserProfileProps {
    userId: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
    const { t, language } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const setCustomAvatar = useAuthStore((state) => state.setCustomAvatar);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;
    const currentAuthor = getCurrentAuthor();

    const isOwnProfile =
        isLoggedIn &&
        (!userId || userId === "demo" || userId === "me" || userId === user?.id ||
        userId === currentAuthor || userId === `@${currentAuthor}` ||
        (user?.username && (userId === `@${user.username}` || userId === user.username)));

    // TanStack Query hooks for profile data
    const cleanUsername = userId?.replace(/^@/, "");
    const { data: myProfileData, isLoading: isMyProfileLoading } = useMyProfileQuery(isOwnProfile && isLoggedIn);
    const { data: otherUserProfileData, isLoading: isOtherProfileLoading } = useUserProfileQuery(!isOwnProfile && !!cleanUsername && cleanUsername !== "me" ? cleanUsername : "");
    const updateProfileMutation = useUpdateProfileMutation();

    useEffect(() => {
        if (isOwnProfile && myProfileData) {
            updateUser({
                id: myProfileData.id,
                name: myProfileData.name || myProfileData.username,
                username: myProfileData.username,
                avatarUrl: myProfileData.avatarUrl || undefined,
                avatar_url: myProfileData.avatarUrl || undefined,
                isVerified: myProfileData.isVerified === true || (myProfileData as { isEmailVerified?: boolean }).isEmailVerified === true,
            });
        }
    }, [isOwnProfile, myProfileData, updateUser]);

    const queryClient = useQueryClient();
    const [uploadFeedback, setUploadFeedback] = useState<{ type: 'loading' | 'success' | 'error'; message: string } | null>(null);

    const handleUploadAvatar = async (file: File) => {
        setUploadFeedback({ type: 'loading', message: t("profile.uploading") });
        try {
            const result = await uploadImageToR2({ file, type: 'avatar' });
            const newUrl = result.avatarUrl || (result.url as string) || (result.imageUrl as string);
            if (newUrl) {
                setIdentity((prev: ProfileIdentity) => ({ ...prev, avatarUrl: newUrl }));
                updateUser({ avatarUrl: newUrl });
                setCustomAvatar(newUrl);
            }
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
            setUploadFeedback({ type: 'success', message: t("profile.uploadSuccess") });
            setTimeout(() => setUploadFeedback(null), 3500);
        } catch {
            setUploadFeedback({ type: 'error', message: t("profile.uploadFailed") });
            setTimeout(() => setUploadFeedback(null), 6000);
        }
    };

    const handleUploadCover = async (file: File) => {
        setUploadFeedback({ type: 'loading', message: t("profile.uploading") });
        try {
            const result = await uploadImageToR2({ file, type: 'cover' });
            const newUrl = result.coverUrl || (result.url as string) || (result.imageUrl as string);
            if (newUrl) {
                setIdentity((prev: ProfileIdentity) => ({ ...prev, coverUrl: newUrl }));
                setCustomBg(newUrl);
            }
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            queryClient.invalidateQueries({ queryKey: ["my-profile"] });
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
            setUploadFeedback({ type: 'success', message: t("profile.uploadSuccess") });
            setTimeout(() => setUploadFeedback(null), 3500);
        } catch {
            setUploadFeedback({ type: 'error', message: t("profile.uploadFailed") });
            setTimeout(() => setUploadFeedback(null), 6000);
        }
    };

    const handleSelectAvatarFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setRawAvatarSrc(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCroppedAvatar = async (croppedDataUrl: string, croppedFile?: File) => {
        setRawAvatarSrc(null);
        setCustomAvatar(croppedDataUrl);
        setIdentity((prev: ProfileIdentity) => ({ ...prev, avatarUrl: croppedDataUrl }));

        const fileToUpload = croppedFile || dataUrlToFile(croppedDataUrl, "avatar.jpg");
        await handleUploadAvatar(fileToUpload);
    };

    const handleSelectCoverFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setRawCoverSrc(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSaveCroppedCover = async (croppedDataUrl: string, croppedFile?: File) => {
        setRawCoverSrc(null);
        setCustomBg(croppedDataUrl);
        setIdentity((prev: ProfileIdentity) => ({ ...prev, coverUrl: croppedDataUrl }));

        const fileToUpload = croppedFile || dataUrlToFile(croppedDataUrl, "cover.jpg");
        await handleUploadCover(fileToUpload);
    };

    const showBookmarks = isOwnProfile && isLoggedIn;

    const remoteProfile = isOwnProfile ? myProfileData : otherUserProfileData;
    const { identity, setIdentity } = useProfileIdentity({ userId, isOwnProfile, currentAuthor, remoteProfile });

    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
    const [warnCustomizeToast, setWarnCustomizeToast] = useState(false);
    const [rawAvatarSrc, setRawAvatarSrc] = useState<string | null>(null);
    const [rawCoverSrc, setRawCoverSrc] = useState<string | null>(null);
    const [customBg, setCustomBg] = useState<string>(DEFAULT_COVER);
    const profileLocation = "";

    const effectiveCover = identity.coverUrl || customBg;

    const isLoading = (isOwnProfile && isMyProfileLoading) || (!isOwnProfile && isOtherProfileLoading);
    const isError = userId === "error" || userId === "not-found";

    // Computer specs / gear data loaded exclusively from API (remoteProfile)
    const remoteGear = useMemo(() => {
        const raw = (remoteProfile as Record<string, unknown>)?.specs || (remoteProfile as Record<string, unknown>)?.gear || (remoteProfile as Record<string, unknown>)?.hardware;
        return (raw && typeof raw === "object") ? (raw as Record<string, string>) : {};
    }, [remoteProfile]);

    const [customGear, setCustomGear] = useState<Record<string, string> | null>(null);
    const gearData = customGear ?? remoteGear;

    const handleGearChange = (key: string, val: string) => {
        setCustomGear((prev) => ({ ...(prev ?? remoteGear), [key]: val }));
    };

    // Hidden sections configuration for customize mode
    const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem(`profile_hidden_sections_${userId || "me"}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [isCustomizeMode, setIsCustomizeMode] = useState(false);
    const [snapshotIdentity, setSnapshotIdentity] = useState<ProfileIdentity | null>(null);
    const [snapshotGear, setSnapshotGear] = useState<Record<string, string> | null>(null);
    const [snapshotHiddenSections, setSnapshotHiddenSections] = useState<Record<string, boolean> | null>(null);

    const handleStartEditMode = () => {
        setSnapshotIdentity({ ...identity });
        setSnapshotGear({ ...gearData });
        setSnapshotHiddenSections({ ...hiddenSections });
        setIsCustomizeMode(true);
        setActiveTab("overview");
    };

    const handleSaveEdit = () => {
        try {
            localStorage.setItem(`profile_hidden_sections_${userId || "me"}`, JSON.stringify(hiddenSections));
        } catch {
            // Ignore storage error
        }
        if (isOwnProfile) {
            const payload: UpdateProfileDto = {};

            const trimmedBio = identity.bio !== undefined ? identity.bio.trim() : undefined;
            const originalBio = snapshotIdentity?.bio !== undefined
                ? snapshotIdentity.bio.trim()
                : (remoteProfile?.bio || "").trim();

            if (trimmedBio !== undefined && trimmedBio !== originalBio) {
                payload.bio = trimmedBio;
            }

            const trimmedName = identity.name?.trim();
            const originalName = (snapshotIdentity?.name || remoteProfile?.name || remoteProfile?.username || currentAuthor || "").trim();

            if (trimmedName && trimmedName !== originalName) {
                payload.name = trimmedName;
            }

            const cleanUsername = identity.username?.trim().replace(/^@/, "");
            const originalUsername = (snapshotIdentity?.username || remoteProfile?.username || "").trim().replace(/^@/, "");

            if (cleanUsername && cleanUsername !== originalUsername) {
                payload.username = cleanUsername;
            }

            if (identity.avatarUrl && identity.avatarUrl !== snapshotIdentity?.avatarUrl) {
                payload.avatarUrl = identity.avatarUrl;
            }
            if (identity.coverUrl && identity.coverUrl !== snapshotIdentity?.coverUrl) {
                payload.coverUrl = identity.coverUrl;
            }

            if (Object.keys(payload).length > 0) {
                updateProfileMutation.mutate(
                    payload,
                    {
                        onSuccess: (updatedProfile) => {
                            updateUser({
                                name: updatedProfile?.name || (payload.name ? identity.name?.trim() : undefined),
                                username: updatedProfile?.username || (payload.username ? identity.username?.trim().replace(/^@/, "") : undefined),
                                bio: updatedProfile?.bio ?? (payload.bio !== undefined ? identity.bio?.trim() : undefined),
                                avatarUrl: updatedProfile?.avatarUrl,
                            });
                            triggerToast();
                        },
                        onError: () => {
                            triggerToast();
                        },
                    }
                );
            } else {
                triggerToast();
            }
        } else {
            triggerToast();
        }
        setIsCustomizeMode(false);
        setSnapshotIdentity(null);
        setSnapshotGear(null);
        setSnapshotHiddenSections(null);
    };

    const handleDiscardEdit = () => {
        if (snapshotIdentity) setIdentity(snapshotIdentity);
        if (snapshotGear) setCustomGear(snapshotGear);
        if (snapshotHiddenSections) setHiddenSections(snapshotHiddenSections);
        setIsCustomizeMode(false);
        setSnapshotIdentity(null);
        setSnapshotGear(null);
        setSnapshotHiddenSections(null);
    };

    const handleToggleHideSection = (sectionId: string) => {
        setHiddenSections((prev) => {
            const next = { ...prev, [sectionId]: !prev[sectionId] };
            try {
                localStorage.setItem(`profile_hidden_sections_${userId || "me"}`, JSON.stringify(next));
            } catch {
                // Ignore storage error
            }
            return next;
        });
    };

    const handleToggleCustomizeMode = () => {
        if (!isCustomizeMode) {
            handleStartEditMode();
        } else {
            handleSaveEdit();
        }
    };

    const handleTabChange = (tab: ProfileTab) => {
        if (isCustomizeMode && tab !== "overview") {
            setWarnCustomizeToast(true);
            setTimeout(() => setWarnCustomizeToast(false), 4000);
            return;
        }
        setActiveTab(tab);
    };

    // User's posts
    const allPosts = usePostsStore((state) => state.posts);
    const displayPosts = allPosts.filter((p) => {
        const pName = typeof p.author === "string" ? p.author : (p.author?.name || p.author?.username || "");
        const pUsername = typeof p.author === "object" ? p.author?.username : "";
        const pId = typeof p.author === "object" ? p.author?.id : "";

        if (isOwnProfile) {
            if (pName === identity.name || pName === "Bạn" || pName === currentAuthor) return true;
            if (user?.id && pId === user.id) return true;
            if (user?.username && (pUsername === user.username || pName === user.username)) return true;
            return false;
        }

        const targetName = identity.name;
        const targetUsername = cleanUsername || "";

        if (pId && (pId === cleanUsername || pId === userId)) return true;
        if (pName && (pName === targetName || pName === targetUsername)) return true;
        if (pUsername && (pUsername === targetUsername || pUsername === targetName)) return true;

        if (pName && targetName && pName.toLowerCase() === targetName.toLowerCase()) return true;
        if (pUsername && targetUsername && pUsername.toLowerCase() === targetUsername.toLowerCase()) return true;

        return false;
    });

    // Real Friendships API Queries
    const { data: rawFriends = [], isLoading: isFriendsLoading } = useFriendsQuery(!!user);
    const { data: rawIncomingRequests = [], isLoading: isIncomingLoading } = useIncomingFriendRequestsQuery(!!user);
    const { data: rawOutgoingRequests = [], isLoading: isOutgoingLoading } = useOutgoingFriendRequestsQuery(!!user);
    const { data: rawBlockedUsers = [], isLoading: isBlockedLoading } = useBlockedUsersQuery(!!user);

    // Friendships Mutations
    const sendFriendRequestMutation = useSendFriendRequestMutation();
    const acceptFriendRequestMutation = useAcceptFriendRequestMutation();
    const cancelFriendRequestMutation = useCancelFriendRequestMutation();
    const unfriendMutation = useUnfriendMutation();
    const blockUserMutation = useBlockUserMutation();
    const unblockUserMutation = useUnblockUserMutation();

    const currentUserId = user?.id;

    const friendsList = useMemo<FriendEntry[]>(() => {
        if (!Array.isArray(rawFriends)) return [];
        return rawFriends
            .map((item) => extractFriendEntry(item, currentUserId))
            .filter((f): f is FriendEntry => f !== null);
    }, [rawFriends, currentUserId]);

    const friendRequestsList = useMemo<FriendRequest[]>(() => {
        if (!Array.isArray(rawIncomingRequests)) return [];
        return rawIncomingRequests
            .map((item) => extractFriendRequest(item))
            .filter((r): r is FriendRequest => r !== null);
    }, [rawIncomingRequests]);

    const outgoingRequestsList = useMemo<FriendRequest[]>(() => {
        if (!Array.isArray(rawOutgoingRequests)) return [];
        return rawOutgoingRequests
            .map((item) => extractFriendRequest(item))
            .filter((r): r is FriendRequest => r !== null);
    }, [rawOutgoingRequests]);

    const blockedUsersList = useMemo<FriendEntry[]>(() => {
        if (!Array.isArray(rawBlockedUsers)) return [];
        return rawBlockedUsers
            .map((item) => extractFriendEntry(item, currentUserId))
            .filter((b): b is FriendEntry => b !== null);
    }, [rawBlockedUsers, currentUserId]);

    const targetUserId = otherUserProfileData?.userId || otherUserProfileData?.id || remoteProfile?.userId || remoteProfile?.id || "";
    const targetUserHandle = identity.handle?.replace(/^@/, "").toLowerCase() || "";
    const targetUserName = identity.name.toLowerCase();

    // Check relationship with target profile
    const currentFriendEntry = useMemo(() => {
        if (isOwnProfile) return null;
        return friendsList.find((f) => {
            if (targetUserId && (f.userId === targetUserId || f.id === targetUserId)) return true;
            if (f.handle && targetUserHandle && f.handle.replace(/^@/, "").toLowerCase() === targetUserHandle) return true;
            if (f.name && f.name.toLowerCase() === targetUserName) return true;
            return false;
        }) || null;
    }, [isOwnProfile, friendsList, targetUserId, targetUserHandle, targetUserName]);

    const outgoingRequestEntry = useMemo(() => {
        if (isOwnProfile) return null;
        return outgoingRequestsList.find((r) => {
            if (targetUserId && (r.userId === targetUserId || r.id === targetUserId)) return true;
            if (r.handle && targetUserHandle && r.handle.replace(/^@/, "").toLowerCase() === targetUserHandle) return true;
            if (r.name && r.name.toLowerCase() === targetUserName) return true;
            return false;
        }) || null;
    }, [isOwnProfile, outgoingRequestsList, targetUserId, targetUserHandle, targetUserName]);

    const incomingRequestEntry = useMemo(() => {
        if (isOwnProfile) return null;
        return friendRequestsList.find((r) => {
            if (targetUserId && (r.userId === targetUserId || r.id === targetUserId)) return true;
            if (r.handle && targetUserHandle && r.handle.replace(/^@/, "").toLowerCase() === targetUserHandle) return true;
            if (r.name && r.name.toLowerCase() === targetUserName) return true;
            return false;
        }) || null;
    }, [isOwnProfile, friendRequestsList, targetUserId, targetUserHandle, targetUserName]);

    const blockedEntry = useMemo(() => {
        if (isOwnProfile) return null;
        return blockedUsersList.find((b) => {
            if (targetUserId && (b.userId === targetUserId || b.id === targetUserId)) return true;
            if (b.handle && targetUserHandle && b.handle.replace(/^@/, "").toLowerCase() === targetUserHandle) return true;
            if (b.name && b.name.toLowerCase() === targetUserName) return true;
            return false;
        }) || null;
    }, [isOwnProfile, blockedUsersList, targetUserId, targetUserHandle, targetUserName]);

    const isFriend = !!currentFriendEntry;
    const isPendingOutgoing = !!outgoingRequestEntry;
    const isPendingIncoming = !!incomingRequestEntry;
    const isBlocked = !!blockedEntry;

    const isFriendActionLoading =
        sendFriendRequestMutation.isPending ||
        acceptFriendRequestMutation.isPending ||
        cancelFriendRequestMutation.isPending ||
        unfriendMutation.isPending ||
        blockUserMutation.isPending ||
        unblockUserMutation.isPending;

    const handleAddFriend = async (friendTarget?: FriendEntry | string) => {
        const targetId = typeof friendTarget === "object" ? (friendTarget.userId || friendTarget.id) : (targetUserId || (typeof friendTarget === "string" ? friendTarget : ""));
        if (!targetId) return;
        try {
            await sendFriendRequestMutation.mutateAsync({ addresseeId: targetId });
            triggerToast();
        } catch (e) {
            console.error("Failed to send friend request:", e);
        }
    };

    const handleUnfriend = async (friendTarget?: FriendEntry | string) => {
        let friendshipId = typeof friendTarget === "object" ? (friendTarget.friendshipId || friendTarget.id) : undefined;
        if (!friendshipId && currentFriendEntry) {
            friendshipId = currentFriendEntry.friendshipId || currentFriendEntry.id;
        }
        if (!friendshipId && typeof friendTarget === "string") {
            friendshipId = friendTarget;
        }
        if (!friendshipId) return;
        try {
            await unfriendMutation.mutateAsync(friendshipId);
            triggerToast();
        } catch (e) {
            console.error("Failed to unfriend:", e);
        }
    };

    const handleAcceptRequest = async (req?: FriendRequest) => {
        const reqId = req?.id || incomingRequestEntry?.id;
        if (!reqId) return;
        try {
            await acceptFriendRequestMutation.mutateAsync(reqId);
            triggerToast();
        } catch (e) {
            console.error("Failed to accept friend request:", e);
        }
    };

    const handleDeclineRequest = async (id?: string) => {
        const reqId = id || incomingRequestEntry?.id;
        if (!reqId) return;
        try {
            await cancelFriendRequestMutation.mutateAsync(reqId);
            triggerToast();
        } catch (e) {
            console.error("Failed to decline friend request:", e);
        }
    };

    const handleCancelOutgoingRequest = async (id?: string) => {
        const reqId = id || outgoingRequestEntry?.id;
        if (!reqId) return;
        try {
            await cancelFriendRequestMutation.mutateAsync(reqId);
            triggerToast();
        } catch (e) {
            console.error("Failed to cancel friend request:", e);
        }
    };

    const handleBlockFriend = async (userTarget?: FriendEntry | string) => {
        const blockId = typeof userTarget === "object" ? (userTarget.userId || userTarget.id) : (targetUserId || (typeof userTarget === "string" ? userTarget : ""));
        if (!blockId) return;
        try {
            await blockUserMutation.mutateAsync(blockId);
            triggerToast();
        } catch (e) {
            console.error("Failed to block user:", e);
        }
    };

    const handleUnblockUser = async (userTarget?: FriendEntry | string) => {
        const unblockId = typeof userTarget === "object" ? (userTarget.friendshipId || userTarget.id) : (blockedEntry?.friendshipId || blockedEntry?.id || (typeof userTarget === "string" ? userTarget : ""));
        if (!unblockId) return;
        try {
            await unblockUserMutation.mutateAsync(unblockId);
            triggerToast();
        } catch (e) {
            console.error("Failed to unblock user:", e);
        }
    };

    // Guestbook backend queries & mutations
    const targetProfileId = remoteProfile?.id || (isOwnProfile ? (myProfileData?.id || user?.id) : otherUserProfileData?.id) || "";
    const { data: rawGuestbookComments = [], isLoading: isGuestbookLoading } = useGuestbookCommentsQuery(targetProfileId, !!targetProfileId);
    const createGuestbookMutation = useCreateGuestbookCommentMutation();
    const deleteGuestbookMutation = useDeleteGuestbookCommentMutation();

    const [likedCommentsMap, setLikedCommentsMap] = useState<Record<string, boolean>>({});
    const [newCommentText, setNewCommentText] = useState("");

    const displayedGuestbookComments = useMemo<GuestbookComment[]>(() => {
        if (!Array.isArray(rawGuestbookComments)) return [];
        return rawGuestbookComments.map((c) => {
            const authorName = c.author?.name || c.author?.username || c.authorName || c.authorUsername || "Gamer";
            const authorAvatar = c.author?.avatarUrl || c.author?.avatar_url || c.author?.avatar || c.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(c.authorId || c.id)}`;
            const isLiked = !!likedCommentsMap[c.id];
            const canDelete = isOwnProfile || (!!user?.id && (c.authorId === user.id || c.author?.id === user.id));

            return {
                id: c.id,
                author: authorName,
                avatar: authorAvatar,
                date: c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "Vừa xong",
                content: c.content,
                likes: (c.likes || 0) + (isLiked ? 1 : 0),
                isLiked,
                authorId: c.authorId || c.author?.id,
                canDelete,
            };
        });
    }, [rawGuestbookComments, likedCommentsMap, isOwnProfile, user]);

    const handleAddGuestbook = async (e: React.FormEvent) => {
        e.preventDefault();
        const commentContent = newCommentText.trim();
        if (!commentContent) return;
        if (!targetProfileId) {
            triggerToast(false, "Không tìm thấy thông tin hồ sơ để gửi lời nhắn.");
            return;
        }
        if (!isLoggedIn) {
            triggerToast(false, "Vui lòng đăng nhập để gửi lời nhắn.");
            return;
        }

        try {
            await createGuestbookMutation.mutateAsync({
                profileId: targetProfileId,
                data: { content: commentContent },
            });
            setNewCommentText("");
            triggerToast(true, "Đã gửi lời nhắn lên sổ lưu bút thành công!");
        } catch (err: unknown) {
            const errorMsg = (err as { message?: string })?.message || "Không thể gửi lời nhắn, vui lòng thử lại.";
            triggerToast(false, errorMsg);
        }
    };

    const handleDeleteGuestbook = async (commentId: string) => {
        if (!targetProfileId) return;
        try {
            await deleteGuestbookMutation.mutateAsync({
                profileId: targetProfileId,
                id: commentId,
            });
            triggerToast(true, "Đã xóa lời nhắn.");
        } catch (err: unknown) {
            const errorMsg = (err as { message?: string })?.message || "Không thể xóa lời nhắn.";
            triggerToast(false, errorMsg);
        }
    };

    const toggleLikeComment = (id: string) => {
        setLikedCommentsMap((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Library games backend queries & mutations
    const libraryGamesUserId = targetUserId || remoteProfile?.id || (isOwnProfile ? (myProfileData?.id || user?.id) : otherUserProfileData?.id) || cleanUsername || "";
    const { data: rawLibraryGames = [], isLoading: isLibraryGamesLoading } = useLibraryGamesQuery(libraryGamesUserId, !!libraryGamesUserId);
    const createLibraryGameMutation = useCreateLibraryGameMutation();
    const deleteLibraryGameMutation = useDeleteLibraryGameMutation();

    const displayedLibraryGames = useMemo<LibraryGame[]>(() => {
        if (!Array.isArray(rawLibraryGames)) return [];
        return rawLibraryGames.map((g) => ({
            id: g.id,
            name: g.name,
            logo: g.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
            hours: g.hours ?? 0,
            lastPlayed: g.lastPlayed || "Gần đây",
            achievements: g.achievements ?? 0,
            totalAchievements: g.totalAchievements ?? 0,
            keyStat: g.keyStat || (g.hours ? `${g.hours}h chơi` : "Đang chơi"),
            rank: g.rank || "Player",
            mvpCount: g.mvpCount || "0",
            kdRatio: g.kdRatio || "1.0",
            tagColor: g.tagColor || "bg-[#1688E8]",
            isFeatured: false,
        }));
    }, [rawLibraryGames]);

    const handleAddLibraryGame = async (gameData: { name: string; hours?: number; rank?: string; logo?: string }) => {
        try {
            await createLibraryGameMutation.mutateAsync({
                name: gameData.name,
                hours: gameData.hours || 0,
                rank: gameData.rank || "Player",
                logo: gameData.logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&auto=format&fit=crop&q=80",
                keyStat: `${gameData.hours || 0}h chơi`,
            });
            triggerToast(true, "Đã thêm game vào thư viện thành công!");
        } catch (err: unknown) {
            const errorMsg = (err as { message?: string })?.message || "Không thể thêm game vào thư viện.";
            triggerToast(false, errorMsg);
        }
    };

    const handleDeleteLibraryGame = async (gameId: string | number) => {
        try {
            await deleteLibraryGameMutation.mutateAsync(String(gameId));
            triggerToast(true, "Đã xóa game khỏi thư viện.");
        } catch (err: unknown) {
            const errorMsg = (err as { message?: string })?.message || "Không thể xóa game khỏi thư viện.";
            triggerToast(false, errorMsg);
        }
    };

    const [toastState, setToastState] = useState<{ isError?: boolean; message?: string } | null>(null);

    const triggerToast = (isSuccess = true, customMsg?: string) => {
        const message = customMsg || (isSuccess ? t("profile.editSuccess") : t("profile.editError"));
        setToastState({ isError: !isSuccess, message });
        setTimeout(() => setToastState(null), 2500);
    };

    const avatarUrl = (isOwnProfile && customAvatar) ? customAvatar : (identity.avatarUrl || (identity as Record<string, unknown>).avatar as string | undefined);

    const rankCfg = getRankConfigIfPresent((remoteProfile as Record<string, unknown>)?.rank ?? identity.rank);
    const forumRankNode = rankCfg ? (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-bold ${rankCfg.badgeBg} ${rankCfg.color}`}>
            <FontAwesomeIcon icon={rankCfg.icon} />
            <span>{getRankLabel(rankCfg, language)}</span>
        </span>
    ) : null;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-text-muted">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl animate-spin text-primary" />
                <span className="text-sm font-semibold">{t("profile.loadingProfile")}</span>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full max-w-lg mx-auto my-12 p-8 rounded-3xl bg-surface border border-rose-500/30 flex flex-col items-center text-center gap-4 shadow-xl animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h3 className="text-xl font-extrabold text-text">Không tìm thấy hồ sơ người dùng</h3>
                <p className="text-sm text-text-muted">Hồ sơ người dùng này không tồn tại, đã bị xóa hoặc đường dẫn không chính xác.</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-2 px-6 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-hover flex items-center gap-2 transition-all cursor-pointer"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Quay lại</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-5 pb-20 animate-fade-in">
            {toastState && (
                <div className={`fixed top-20 right-6 z-50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left font-semibold text-sm ${
                    toastState.isError ? 'bg-[#FF4D4D]' : 'bg-[#24C58A]'
                }`}>
                    <FontAwesomeIcon icon={toastState.isError ? faExclamationTriangle : faCheckCircle} className="text-lg" />
                    <span>{toastState.message}</span>
                </div>
            )}

            {warnCustomizeToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#E5A93D] text-black px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left font-bold text-sm">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-base" />
                    <span>{t("profile.warnCustomize")}</span>
                </div>
            )}

            {uploadFeedback && (
                <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left font-semibold text-sm text-white ${
                    uploadFeedback.type === 'loading'
                        ? 'bg-[#1597FF]'
                        : uploadFeedback.type === 'success'
                        ? 'bg-[#24C58A]'
                        : 'bg-[#FF4D4D]'
                }`}>
                    {uploadFeedback.type === 'loading' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {uploadFeedback.type === 'success' && <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />}
                    {uploadFeedback.type === 'error' && <FontAwesomeIcon icon={faExclamationTriangle} className="text-lg" />}
                    <span>{uploadFeedback.message}</span>
                </div>
            )}

            {/* Gamer Hero Header */}
            <ProfileHero
                coverSrc={effectiveCover}
                avatarUrl={avatarUrl}
                isOwnProfile={isOwnProfile}
                identity={identity}
                onIdentityChange={(next) => setIdentity((prev: ProfileIdentity) => ({ ...prev, ...next }))}
                forumRankNode={forumRankNode}
                isFriend={isFriend}
                isBlocked={isBlocked}
                isPendingOutgoing={isPendingOutgoing}
                isPendingIncoming={isPendingIncoming}
                isFriendActionLoading={isFriendActionLoading}
                onCancelRequest={handleCancelOutgoingRequest}
                onAcceptRequest={handleAcceptRequest}
                onSelectCoverFile={handleSelectCoverFile}
                onSelectAvatarFile={handleSelectAvatarFile}
                onSaveIdentity={triggerToast}
                isCustomizeMode={isCustomizeMode}
                onToggleCustomizeMode={handleToggleCustomizeMode}
                isEditMode={isCustomizeMode}
                onStartEditMode={handleStartEditMode}
                onSaveEdit={handleSaveEdit}
                onDiscardEdit={handleDiscardEdit}
                onAddFriend={() => handleAddFriend()}
                onUnfriend={() => handleUnfriend()}
                onBlock={() => handleBlockFriend()}
                onUnblock={() => handleUnblockUser()}
                location={profileLocation}
                joinedDate={identity.createdAt ? new Date(identity.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" }) : undefined}
                reputationPercent={0}
                followersCount={friendsList.length}
                postsCount={displayPosts.length}
                communitiesCount={COMMUNITY_REPUTATIONS.length}
                t={t}
            />

            {rawCoverSrc && (
                <ImageCropperModal
                    rawImageSrc={rawCoverSrc}
                    onClose={() => setRawCoverSrc(null)}
                    onSave={handleSaveCroppedCover}
                    aspectRatio={4.5}
                    title={t("profile.uploadCover", { defaultValue: "Căn chỉnh ảnh bìa" })}
                    outputWidth={1200}
                />
            )}

            {rawAvatarSrc && (
                <ImageCropperModal
                    rawImageSrc={rawAvatarSrc}
                    onClose={() => setRawAvatarSrc(null)}
                    onSave={handleSaveCroppedAvatar}
                    aspectRatio={1}
                    title={t("profile.changeAvatar", { defaultValue: "Căn chỉnh ảnh đại diện" })}
                    outputWidth={400}
                />
            )}

            {/* Profile Tab Navigation Bar */}
            <ProfileTabBar
                activeTab={activeTab}
                onChange={handleTabChange}
                friendsCount={friendsList.length}
                showBookmarks={showBookmarks}
                isCustomizeMode={isCustomizeMode}
                t={t}
            />

            {/* Tab Views */}
            <div className="w-full transition-all duration-300 min-h-[480px]">
                {activeTab === "overview" && (
                    <OverviewTab
                        identity={identity}
                        games={displayedLibraryGames}
                        isLoadingGames={isLibraryGamesLoading}
                        reputations={COMMUNITY_REPUTATIONS}
                        activities={RECENT_ACTIVITIES}
                        gearData={gearData}
                        isOwnProfile={isOwnProfile}
                        isCustomizeMode={isCustomizeMode}
                        hiddenSections={hiddenSections}
                        onToggleHideSection={handleToggleHideSection}
                        onCloseCustomizeMode={() => setIsCustomizeMode(false)}
                        onGearChange={handleGearChange}
                        onSaveGear={triggerToast}
                        onIdentityChange={(next) => setIdentity((prev: ProfileIdentity) => ({ ...prev, ...next }))}
                        onSaveIdentity={triggerToast}
                        onNavigateToGames={() => handleTabChange("games")}
                        t={t}
                    />
                )}

                {activeTab === "games" && (
                    <GamesTab
                        games={displayedLibraryGames}
                        isLoading={isLibraryGamesLoading}
                        isOwnProfile={isOwnProfile}
                        onAddGame={handleAddLibraryGame}
                        onDeleteGame={handleDeleteLibraryGame}
                        isSubmitting={createLibraryGameMutation.isPending}
                        t={t}
                    />
                )}

                {activeTab === "communities" && <CommunitiesTab reputations={COMMUNITY_REPUTATIONS} t={t} />}

                {activeTab === "posts" && <PostsTab posts={displayPosts} t={t} />}

                {activeTab === "friends" && (
                    <FriendsTab
                        friends={friendsList}
                        requests={friendRequestsList}
                        outgoingRequests={outgoingRequestsList}
                        blockedUsers={blockedUsersList}
                        isLoading={isFriendsLoading || isIncomingLoading || isOutgoingLoading || isBlockedLoading}
                        isOwnProfile={isOwnProfile}
                        onToggleFriend={handleAddFriend}
                        onBlockFriend={handleBlockFriend}
                        onAcceptRequest={handleAcceptRequest}
                        onDeclineRequest={handleDeclineRequest}
                        onCancelOutgoingRequest={handleCancelOutgoingRequest}
                        onUnblockUser={handleUnblockUser}
                        t={t}
                    />
                )}

                {activeTab === "bookmarks" && showBookmarks && <BookmarkList />}

                {activeTab === "guestbook" && (
                    <GuestbookTab
                        comments={displayedGuestbookComments}
                        newCommentText={newCommentText}
                        onChangeNewComment={setNewCommentText}
                        onSubmit={handleAddGuestbook}
                        onToggleLike={toggleLikeComment}
                        onDeleteComment={handleDeleteGuestbook}
                        isLoading={isGuestbookLoading}
                        isSubmitting={createGuestbookMutation.isPending}
                        displayName={identity.name}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

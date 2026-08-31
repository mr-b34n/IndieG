import React, { useState } from "react";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { useAuthStore } from "@/features/auth";
import { usePostsStore, getCurrentAuthor } from "@/features/post";
import { getUserRankConfig, getRankLabel } from "@/features/post/helpers/userRanks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSpinner, faExclamationTriangle, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { ImageCropperModal } from "./ImageCropperModal";
import { ProfileHero } from "./ProfileHero";
import { ProfileTabBar } from "./ProfileTabBar";

import {
    DEFAULT_COVER, LIBRARY_GAMES,
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
import { useMyProfileQuery, useUserProfileQuery, useUpdateProfileMutation } from "@/shared/api/useQueries";

interface UserProfileProps {
    userId: string;
}

export const UserProfile = ({ userId }: UserProfileProps) => {
    const { t, language } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const customAvatar = useAuthStore((state) => state.customAvatar);
    const setCustomAvatar = useAuthStore((state) => state.setCustomAvatar);
    const mockLogin = useAuthStore((state) => state.mockLogin);
    const isLoggedIn = !!user || mockLogin;
    const currentAuthor = getCurrentAuthor();

    const isOwnProfile =
        isLoggedIn &&
        (!userId || userId === "demo" || userId === "me" || userId === user?.id ||
        userId === currentAuthor || userId === `@${currentAuthor.toLowerCase().replace(/\s+/g, "_")}` ||
        (user?.username && userId === `@${user.username.toLowerCase().replace(/\s+/g, "_")}`));

    // TanStack Query hooks for profile data
    const cleanUsername = userId?.replace(/^@/, "");
    const { data: myProfileData, isLoading: isMyProfileLoading } = useMyProfileQuery(isOwnProfile && isLoggedIn);
    const { data: otherUserProfileData, isLoading: isOtherProfileLoading } = useUserProfileQuery(!isOwnProfile && !!cleanUsername && cleanUsername !== "me" ? cleanUsername : "");
    const updateProfileMutation = useUpdateProfileMutation();

    const showBookmarks = isOwnProfile && isLoggedIn;

    const remoteProfile = isOwnProfile ? myProfileData : otherUserProfileData;
    const { identity, setIdentity } = useProfileIdentity({ userId, isOwnProfile, currentAuthor, remoteProfile });

    const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [warnCustomizeToast, setWarnCustomizeToast] = useState(false);
    const [rawAvatarSrc, setRawAvatarSrc] = useState<string | null>(null);
    const [rawCoverSrc, setRawCoverSrc] = useState<string | null>(null);
    const [customBg, setCustomBg] = useState<string>(DEFAULT_COVER);
    const profileLocation = "";

    const effectiveCover = identity.coverUrl || customBg;

    const isLoading = (isOwnProfile && isMyProfileLoading) || (!isOwnProfile && isOtherProfileLoading);
    const isError = userId === "error" || userId === "not-found";

    // Start with empty gear setup by default (no mock presets)
    const [gearData, setGearData] = useState<Record<string, string>>(() => {
        try {
            const saved = localStorage.getItem(`profile_gear_${userId || "me"}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const handleGearChange = (key: string, val: string) => {
        setGearData((prev) => {
            const next = { ...prev, [key]: val };
            try {
                localStorage.setItem(`profile_gear_${userId || "me"}`, JSON.stringify(next));
            } catch {
                // Ignore storage error
            }
            return next;
        });
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
            localStorage.setItem(`profile_gear_${userId || "me"}`, JSON.stringify(gearData));
        } catch {
            // Ignore storage error
        }
        try {
            localStorage.setItem(`profile_hidden_sections_${userId || "me"}`, JSON.stringify(hiddenSections));
        } catch {
            // Ignore storage error
        }
        if (isOwnProfile) {
            updateProfileMutation.mutate(
                {
                    name: identity.name.trim(),
                    bio: identity.bio?.trim(),
                },
                {
                    onSuccess: () => {
                        try {
                            const savedUser = localStorage.getItem("indieg_auth_user");
                            if (savedUser) {
                                const parsed = JSON.parse(savedUser);
                                parsed.name = identity.name.trim();
                                localStorage.setItem("indieg_auth_user", JSON.stringify(parsed));
                            }
                        } catch {
                            // Ignore
                        }
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
        setIsCustomizeMode(false);
        setSnapshotIdentity(null);
        setSnapshotGear(null);
        setSnapshotHiddenSections(null);
    };

    const handleDiscardEdit = () => {
        if (snapshotIdentity) setIdentity(snapshotIdentity);
        if (snapshotGear) setGearData(snapshotGear);
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
        if (isOwnProfile) {
            return p.author === identity.name || p.author === "Bạn" || p.author === currentAuthor;
        }
        return p.author.toLowerCase() === identity.name.toLowerCase() ||
               p.author.toLowerCase() === cleanUsername?.toLowerCase();
    });

    // Friends list state
    const [friendsList, setFriendsList] = useState<FriendEntry[]>([]);
    const [friendRequestsList, setFriendRequestsList] = useState<FriendRequest[]>([]);

    const [isFriend, setIsFriend] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const toggleFriend = (name: string) => {
        setFriendsList((prev) =>
            prev.map((f) => (f.name === name ? { ...f, isFriend: !f.isFriend } : f))
        );
        setIsFriend((prev) => !prev);
        triggerToast();
    };

    const blockFriend = (name: string) => {
        setFriendsList((prev) => prev.filter((f) => f.name !== name));
        setIsBlocked(true);
        triggerToast();
    };

    const handleAcceptRequest = (req: FriendRequest) => {
        setFriendRequestsList((prev) => prev.filter((r) => r.id !== req.id));
        setFriendsList((prev) => [
            ...prev,
            { id: req.id, name: req.name, handle: req.handle, avatar: req.avatar, status: "online", isFriend: true },
        ]);
        triggerToast();
    };

    const handleDeclineRequest = (id: string) => {
        setFriendRequestsList((prev) => prev.filter((r) => r.id !== id));
    };

    // Guestbook comments state
    const [guestbookComments, setGuestbookComments] = useState<GuestbookComment[]>([]);
    const [newCommentText, setNewCommentText] = useState("");

    const handleAddGuestbook = () => {
        if (!newCommentText.trim()) return;
        const commentContent = newCommentText.trim();
        setGuestbookComments((prev) => [
            {
                id: `gb-${prev.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
                author: currentAuthor || "Gamer",
                handle: `@${(currentAuthor || "gamer").toLowerCase().replace(/\s+/g, "_")}`,
                avatar: avatarUrl,
                content: commentContent,
                timeAgo: "Vừa xong",
                likes: 0,
                isLiked: false,
            },
            ...prev,
        ]);
        setNewCommentText("");
        triggerToast();
    };

    const toggleLikeComment = (id: string) => {
        setGuestbookComments((prev) =>
            prev.map((c) => {
                if (c.id !== id) return c;
                return {
                    ...c,
                    likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                    isLiked: !c.isLiked,
                };
            })
        );
    };

    const triggerToast = () => {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 2500);
    };

    const avatarUrl = isOwnProfile && customAvatar ? customAvatar : identity.avatar;

    const rankCfg = getUserRankConfig(identity.level || 1);
    const forumRankNode = (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-bold ${rankCfg.badgeBg} ${rankCfg.color}`}>
            <FontAwesomeIcon icon={rankCfg.icon} />
            <span>{getRankLabel(identity.level || 1, language)}</span>
        </span>
    );

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
            {showSuccessToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#24C58A] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-lg" />
                    <span className="font-semibold text-sm">{t("profile.editSuccess")}</span>
                </div>
            )}

            {warnCustomizeToast && (
                <div className="fixed top-20 right-6 z-50 bg-[#E5A93D] text-black px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-left font-bold text-sm">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-base" />
                    <span>Đang ở chế độ chỉnh sửa. Hãy nhấn "Lưu thay đổi" hoặc "Hủy" ở tab Tổng quan trước khi chuyển tab!</span>
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
                onSelectCoverFile={(file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => ev.target?.result && setRawCoverSrc(ev.target.result as string);
                    reader.readAsDataURL(file);
                }}
                onSelectAvatarFile={(file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => ev.target?.result && setRawAvatarSrc(ev.target.result as string);
                    reader.readAsDataURL(file);
                }}
                onSaveIdentity={triggerToast}
                isCustomizeMode={isCustomizeMode}
                onToggleCustomizeMode={handleToggleCustomizeMode}
                isEditMode={isCustomizeMode}
                onStartEditMode={handleStartEditMode}
                onSaveEdit={handleSaveEdit}
                onDiscardEdit={handleDiscardEdit}
                onAddFriend={() => toggleFriend(identity.name)}
                onUnfriend={() => toggleFriend(identity.name)}
                onBlock={() => { setIsBlocked(true); triggerToast(); }}
                onUnblock={() => { setIsBlocked(false); triggerToast(); }}
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
                    onSave={(url) => { setCustomBg(url); setRawCoverSrc(null); triggerToast(); }}
                    aspectRatio={4.5}
                    title={t("profile.uploadCover", { defaultValue: "Căn chỉnh ảnh bìa" })}
                    outputWidth={1200}
                />
            )}

            {rawAvatarSrc && (
                <ImageCropperModal
                    rawImageSrc={rawAvatarSrc}
                    onClose={() => setRawAvatarSrc(null)}
                    onSave={(url) => { setCustomAvatar(url); setRawAvatarSrc(null); triggerToast(); }}
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
                        games={LIBRARY_GAMES}
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
                        t={t}
                    />
                )}

                {activeTab === "games" && <GamesTab games={LIBRARY_GAMES} t={t} />}

                {activeTab === "communities" && <CommunitiesTab reputations={COMMUNITY_REPUTATIONS} t={t} />}

                {activeTab === "posts" && <PostsTab posts={displayPosts} t={t} />}

                {activeTab === "friends" && (
                    <FriendsTab
                        friends={friendsList}
                        requests={friendRequestsList}
                        onToggleFriend={toggleFriend}
                        onBlockFriend={blockFriend}
                        onAcceptRequest={handleAcceptRequest}
                        onDeclineRequest={handleDeclineRequest}
                        t={t}
                    />
                )}

                {activeTab === "bookmarks" && showBookmarks && <BookmarkList />}

                {activeTab === "guestbook" && (
                    <GuestbookTab
                        comments={guestbookComments}
                        newCommentText={newCommentText}
                        onChangeNewComment={setNewCommentText}
                        onSubmit={handleAddGuestbook}
                        onToggleLike={toggleLikeComment}
                        displayName={identity.name}
                        t={t}
                    />
                )}
            </div>
        </div>
    );
};

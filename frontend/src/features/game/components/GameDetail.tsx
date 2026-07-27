
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeart as faHeartSolid,
    faShareNodes,
    faCheck,
    faCircleInfo,
    faUsers,
    faStar,
    faDesktop,
    faCode,
    faBuilding,
    faEye,
    faThumbsUp,
    faFire,
    faXmark,
    faCircleCheck,
    faArrowLeft,
    faComments
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { getGameBySlug } from "../constants";
import { type GameReview } from "../types";

import { useGameStore } from "../store/useGameStore";
import { useAuthStore } from "@/features/auth";
import avatarDefault from "../../../assets/logos/raft-logo.png";

interface GameDetailProps {
    slug: string;
}

const EMPTY_REVIEWS: GameReview[] = [];

export const GameDetail = ({ slug }: GameDetailProps) => {
    const { t, lang } = useTranslation();
    const navigate = useNavigate();
    const isVietnamese = lang === "vi";

    // 1. Get game data by slug
    const game = useMemo(() => getGameBySlug(slug), [slug]);

    // 2. Store hooks
    const followedSlugs = useGameStore((state) => state.followedSlugs);
    const isFollowing = followedSlugs.includes(game.slug.toLowerCase());
    const toggleFollowGame = useGameStore((state) => state.toggleFollowGame);
    const addReview = useGameStore((state) => state.addReview);
    const likeReview = useGameStore((state) => state.likeReview);
    const customReviewsMap = useGameStore((state) => state.customReviews);
    const customReviews = customReviewsMap[game.slug] || EMPTY_REVIEWS;
    
    const user = useAuthStore((state) => state.user);

    // 3. Merged Data
    const allReviews = useMemo(() => [...customReviews, ...game.reviews], [customReviews, game.reviews]);

    // 4. UI States
    const [sysReqType, setSysReqType] = useState<"minimum" | "recommended">("minimum");
    const [copied, setCopied] = useState(false);

    // Modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState<number>(5);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewRec, setReviewRec] = useState<boolean>(true);

    // Handlers
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleCreateReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewContent.trim()) return;
        addReview(game.slug, {
            author: user?.username || "GamerPro",
            authorAvatar: user?.avatarUrl || avatarDefault,
            rating: reviewRating,
            hoursPlayed: "24h",
            content: reviewContent,
            recommended: reviewRec
        });
        setReviewContent("");
        setShowReviewModal(false);
    };

    // Localized text resolvers
    const descriptionText = isVietnamese ? (game.descriptionVi || game.description) : game.description;
    const featuresList = isVietnamese ? (game.featuresVi || game.features) : game.features;
    const sentimentText = isVietnamese ? (game.sentimentVi || game.sentiment) : game.sentiment;

    // Calculate recommended percentage for reviews
    const recommendedPercent = useMemo(() => {
        if (allReviews.length === 0) return 90;
        const recCount = allReviews.filter(r => r.recommended).length;
        return Math.round((recCount / allReviews.length) * 100);
    }, [allReviews]);

    return (
        <div className="w-full pb-20 animate-fade-in">
            {/* Back Navigation & Breadcrumb */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate({ to: "/" })}
                        className="w-10 h-10 rounded-full bg-surface hover:bg-surface-hover border border-border flex items-center justify-center text-text-muted hover:text-text transition-all shadow-sm cursor-pointer"
                        title={t('game.back')}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <div>
                        <h1 className="font-bold text-xl sm:text-2xl text-text flex items-center gap-2">
                            {game.name}
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {game.genre[0] || "Game"}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleShare}
                        className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-text border border-border flex items-center justify-center shadow-sm transition-all relative cursor-pointer"
                        title={t('game.share')}
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} className={copied ? "text-emerald-500" : ""} />
                        {copied && (
                            <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-surface border border-border px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-400 shadow-lg whitespace-nowrap animate-fade-in z-20">
                                {t('game.shared')}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* HERO BANNER & PROFILE HEADER SECTION (Unified with fade-down gradient) */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-border bg-surface shadow-md mb-8">
                {/* Backdrop Image with Gradients fading smoothly down into the card */}
                <div className="absolute inset-0 h-72 sm:h-96 w-full overflow-hidden pointer-events-none">
                    <img
                        src={game.bannerUrl || game.logoUrl}
                        alt={game.name}
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/50 to-transparent" />
                </div>

                {/* Spacer to show off the banner artwork cleanly without overlapping issues */}
                <div className="h-32 sm:h-44 w-full relative z-10" />

                {/* Content Overlay - naturally positioned inside the flow */}
                <div className="relative z-10 p-5 sm:p-8 pt-0 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        {/* Left: Logo + Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-surface bg-surface shadow-2xl shrink-0 p-1">
                                <img
                                    src={game.logoUrl}
                                    alt={game.name}
                                    className="w-full h-full object-cover rounded-xl"
                                />
                            </div>

                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    {game.genre.map((g) => (
                                        <span key={g} className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-surface/90 backdrop-blur-md text-text-muted border border-border/60 shadow-sm">
                                            {g}
                                        </span>
                                    ))}
                                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        {t('game.activePlayers', { count: game.activePlayers.toLocaleString() })}
                                    </span>
                                </div>
                                
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text tracking-tight drop-shadow-sm">
                                    {game.name}
                                </h2>
                                
                                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted">
                                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                                        <FontAwesomeIcon icon={faStar} />
                                        <span>{game.ratingScore} / 5.0</span>
                                    </span>
                                    <span>•</span>
                                    <span className="text-primary font-semibold">{sentimentText}</span>
                                    <span>•</span>
                                    <span>{t('game.totalReviews', { count: (game.totalReviewsCount || allReviews.length).toLocaleString() })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Game Specs Bar: Responsive grid without truncation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-4 px-5 bg-surface-hover/60 rounded-2xl border border-border/60 text-xs sm:text-sm">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-text-faint flex items-center gap-1.5 mb-1">
                                <FontAwesomeIcon icon={faBuilding} className="text-primary shrink-0" />
                                <span>{t('game.developer')}</span>
                            </span>
                            <span className="font-semibold text-text leading-snug break-words">{game.developer}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-text-faint flex items-center gap-1.5 mb-1">
                                <FontAwesomeIcon icon={faCode} className="text-brand-400 shrink-0" />
                                <span>{t('game.publisher')}</span>
                            </span>
                            <span className="font-semibold text-text leading-snug break-words">{game.publisher}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-text-faint flex items-center gap-1.5 mb-1">
                                <FontAwesomeIcon icon={faCircleInfo} className="text-amber-400 shrink-0" />
                                <span>{t('game.releaseDate')}</span>
                            </span>
                            <span className="font-semibold text-text leading-snug break-words">{game.releaseDate}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-semibold text-text-faint flex items-center gap-1.5 mb-1">
                                <FontAwesomeIcon icon={faDesktop} className="text-emerald-400 shrink-0" />
                                <span>{t('game.platforms')}</span>
                            </span>
                            <span className="font-semibold text-text leading-snug break-words">{game.platforms.join(", ")}</span>
                        </div>
                    </div>

                    {/* Action Toolbar: Clean, prominent buttons without clutter */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => toggleFollowGame(game.slug)}
                                className={`flex-1 sm:flex-initial px-4.5 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                                    isFollowing
                                        ? "bg-primary text-white hover:bg-primary-hover shadow-primary/25"
                                        : "bg-surface-hover hover:bg-border/80 text-text border border-border"
                                }`}
                            >
                                <FontAwesomeIcon icon={isFollowing ? faHeartSolid : faHeartOutline} className={isFollowing ? "text-white animate-bounce-short" : "text-primary"} />
                                <span>{isFollowing ? t('game.following') : t('game.follow')}</span>
                            </button>

                            {game.communityId && (
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: `/community/${game.communityId}` })}
                                    className="flex-1 sm:flex-initial px-4.5 py-2 rounded-xl font-semibold text-sm bg-accent-500 hover:bg-accent-600 text-white flex items-center justify-center gap-2 shadow-md shadow-accent-500/25 transition-all cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faComments} />
                                    <span>{t('game.joinCommunity')}</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => navigate({ to: "/squad" })}
                                className="flex-1 sm:flex-initial px-4.5 py-2 rounded-xl font-semibold text-sm bg-surface-hover hover:bg-border/80 text-text border border-border flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faUsers} className="text-brand-400" />
                                <span>{t('game.tabSquad')}</span>
                            </button>
                        </div>

                        <div className="text-xs font-semibold text-text-muted self-center ml-auto hidden md:flex items-center gap-2 bg-surface-hover px-3.5 py-2 rounded-xl border border-border/60">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Official Hub Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT LAYOUT: Clean, spacious full-width cards without sidebars or text truncation */}
            <div className="flex flex-col gap-8 min-w-0">
                    
                    {/* 1. GAME STORY & FEATURES CARD */}
                    <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                            <h3 className="font-bold text-lg sm:text-xl text-text flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0">
                                    <FontAwesomeIcon icon={faCircleInfo} />
                                </span>
                                <span>{t('game.tabOverview')} & Features</span>
                            </h3>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
                                {game.genre.join(" • ")}
                            </span>
                        </div>
                        
                        <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-line break-words">
                            {descriptionText}
                        </p>

                        <div>
                            <h4 className="font-bold text-text text-base mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFire} className="text-amber-500" />
                                <span>{t('game.featuresTitle')}</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {featuresList.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-hover/50 border border-border/50 text-sm text-text-muted">
                                        <span className="w-6 h-6 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                        </span>
                                        <span className="font-medium text-text break-words">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Screenshots Gallery */}
                        {game.screenshots && game.screenshots.length > 0 && (
                            <div className="pt-6 border-t border-border/60">
                                <h4 className="font-bold text-text text-base mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faDesktop} className="text-primary" />
                                    <span>{t('game.screenshotsTitle')}</span>
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {game.screenshots.map((img, idx) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden border border-border/80 group aspect-video relative bg-surface-hover shadow-sm">
                                            <img src={img} alt={`${game.name} screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <FontAwesomeIcon icon={faEye} className="text-white text-xl" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 2. SYSTEM REQUIREMENTS CARD */}
                    {game.systemReqs && (
                        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                                <h3 className="font-bold text-lg sm:text-xl text-text flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-brand-400/10 text-brand-400 flex items-center justify-center text-sm shrink-0">
                                        <FontAwesomeIcon icon={faCode} />
                                    </span>
                                    <span>{t('game.systemReqsTitle')}</span>
                                </h3>
                                <div className="grid grid-cols-2 p-1 bg-surface-hover rounded-xl border border-border/80 w-full sm:w-auto shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setSysReqType("minimum")}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${sysReqType === "minimum" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"}`}
                                    >
                                        {t('game.minimumReqs') || "Tối thiểu"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSysReqType("recommended")}
                                        className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center ${sysReqType === "recommended" ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text"}`}
                                    >
                                        {t('game.recommendedReqs') || "Đề nghị"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(game.systemReqs[sysReqType]).map(([key, val]) => (
                                    <div key={key} className="flex flex-col p-4 rounded-2xl bg-surface-hover/40 border border-border/50">
                                        <span className="font-semibold uppercase tracking-wider text-text-faint text-[11px] mb-1">{t(`game.${key}`) || key}</span>
                                        <span className="text-text font-medium text-sm leading-relaxed break-words">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. COMMUNITY REVIEWS & PLAYER RATINGS */}
                    <div className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-400 shrink-0 shadow-inner">
                                    <span className="text-2xl sm:text-3xl font-bold">{game.ratingScore}</span>
                                    <span className="text-[9px] font-semibold uppercase tracking-wider">OUT OF 5</span>
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2">
                                            <span>{sentimentText}</span>
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
                                        </h3>
                                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full shrink-0">
                                            {recommendedPercent}% Rec.
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-text-muted break-words">
                                        {t('game.totalReviews', { count: (game.totalReviewsCount || allReviews.length).toLocaleString() })} from verified community players
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowReviewModal(true)}
                                className="w-full sm:w-auto px-4.5 py-2 rounded-xl font-semibold text-sm bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faStar} />
                                <span>{t('game.writeReview')}</span>
                            </button>
                        </div>

                        {/* Reviews Feed List */}
                        {allReviews.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {allReviews.map((rev) => {
                                    const revContentText = isVietnamese ? (rev.contentVi || rev.content) : rev.content;
                                    return (
                                        <div key={rev.id} className="bg-surface-hover/40 rounded-2xl border border-border/80 p-5 sm:p-6 flex flex-col gap-4 hover:border-border transition-all min-w-0">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <img src={rev.authorAvatar} alt={rev.author} className="w-10 h-10 rounded-full object-cover ring-1 ring-border shrink-0" />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-text text-sm flex items-center gap-1.5">
                                                            <span className="truncate">{rev.author}</span>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        </span>
                                                        <span className="text-xs text-text-faint">{t('game.hoursPlayed', { hours: rev.hoursPlayed })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                                                        rev.recommended ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                    }`}>
                                                        <FontAwesomeIcon icon={rev.recommended ? faThumbsUp : faXmark} />
                                                        <span>{rev.recommended ? t('game.recommended') : t('game.notRecommended')}</span>
                                                    </span>
                                                    <span className="text-xs text-text-faint">{rev.date}</span>
                                                </div>
                                            </div>

                                            <p className="text-sm sm:text-base text-text-muted leading-relaxed whitespace-pre-line break-words">
                                                {revContentText}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                                                <span className="text-text-faint">Was this review helpful?</span>
                                                <button
                                                    type="button"
                                                    onClick={() => likeReview(game.slug, rev.id)}
                                                    className="flex items-center gap-1.5 font-medium text-text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border/60 cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faThumbsUp} />
                                                    <span>Helpful ({rev.likes})</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="w-full bg-surface-hover/40 rounded-2xl border border-border p-12 text-center text-text-muted flex flex-col items-center gap-3">
                                <FontAwesomeIcon icon={faStar} className="text-3xl text-amber-400/50" />
                                <span className="font-semibold">{t('game.emptyReviews')}</span>
                            </div>
                        )}
                    </div>

            </div>

            {/* MODAL: WRITE REVIEW */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <h3 className="font-bold text-lg text-text flex items-center gap-2">
                                <FontAwesomeIcon icon={faStar} className="text-amber-400" />
                                <span>{t('game.submitReviewModal')}</span>
                            </h3>
                            <button onClick={() => setShowReviewModal(false)} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-text cursor-pointer">
                                <FontAwesomeIcon icon={faXmark} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateReview} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-faint">{t('game.ratingLabel')}</label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className={`text-xl transition-all cursor-pointer ${star <= reviewRating ? "text-amber-400 scale-110" : "text-text-faint hover:text-amber-400"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setReviewRec(true)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                                        reviewRec ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm" : "bg-surface-hover text-text-muted border-border"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faThumbsUp} />
                                    <span>{t('game.recommended')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReviewRec(false)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                                        !reviewRec ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm" : "bg-surface-hover text-text-muted border-border"
                                    }`}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                    <span>{t('game.notRecommended')}</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-text-faint mb-1.5">Review</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder={t('game.reviewContentPlaceholder')}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="px-4.5 py-2 rounded-full font-semibold text-sm bg-surface-hover text-text-muted hover:text-text transition-colors cursor-pointer"
                                >
                                    {t('game.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-full font-semibold text-sm bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/25 transition-all cursor-pointer"
                                >
                                    {t('game.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

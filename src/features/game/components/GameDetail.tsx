import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faShareNodes, faCheck, faArrowLeft, faUsers, faChevronLeft, faChevronRight
} from "@fortawesome/free-solid-svg-icons";
import { faSteam, faWindows, faApple, faLinux } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "@/shared/hooks/useTranslate";
import { Lightbox } from "@/shared/components/ui/Lightbox";
import { useGameStore } from "../store/useGameStore";
import { usePostsStore, Post } from "@/features/post";

interface GameDetailProps {
    slug: string;
}

export const GameDetail = ({ slug }: GameDetailProps) => {
    const { t, lang } = useTranslation();
    const navigate = useNavigate();
    const isVietnamese = lang === "vi";

    const getGameBySlug = useGameStore((state) => state.getGameBySlug);
    const game = useMemo(() => getGameBySlug(slug), [slug, getGameBySlug]);

    const followedSlugs = useGameStore((state) => state.followedSlugs);
    const isFollowing = followedSlugs.includes((game?.slug || slug).toLowerCase());
    const toggleFollowGame = useGameStore((state) => state.toggleFollowGame);

    const allPosts = usePostsStore((state) => state.posts);
    const relatedPosts = useMemo(() => {
        if (!game) return [];
        const gameTagLower = (game.tag || game.name || "").toLowerCase();
        const communityIdLower = (game.communityId || "").toString().toLowerCase();

        return allPosts.filter((p) => {
            const postTag = (p.gameTag || "").toLowerCase();
            const postCommunity = (p.communityId || "").toString().toLowerCase();
            return (
                postTag.includes(gameTagLower) ||
                gameTagLower.includes(postTag) ||
                (communityIdLower && postCommunity === communityIdLower)
            );
        }).slice(0, 5);
    }, [allPosts, game]);

    const [copied, setCopied] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handlePrevMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMediaIndex(prev => (prev === 0 ? game.screenshots.length - 1 : prev - 1));
    };

    const handleNextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedMediaIndex(prev => (prev === game.screenshots.length - 1 ? 0 : prev + 1));
    };

    const descriptionText = isVietnamese ? (game.descriptionVi || game.description) : game.description;
    const featuresList = isVietnamese ? (game.featuresVi || game.features) : game.features;
    // @ts-ignore
    const summaryText = game.summary || descriptionText.slice(0, 150) + "...";
    
    // Derived values
    const hasMedia = game.screenshots && game.screenshots.length > 0;
    const isFree = game.price === "Miễn phí (Free to Play)" || game.price?.toLowerCase().includes("free");

    return (
        <div className="w-full pb-24 animate-fade-in bg-background min-h-screen text-text">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-2 sticky top-0 z-50 bg-background/95 backdrop-blur-lg py-4 px-4 md:px-8 border-b border-border/10">
                <button
                    type="button"
                    onClick={() => navigate({ to: "/" })}
                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div className="flex-1 text-center font-bold text-base tracking-tight">{game.name}</div>
                <button
                    type="button"
                    onClick={handleShare}
                    className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition-colors relative cursor-pointer"
                >
                    <FontAwesomeIcon icon={copied ? faCheck : faShareNodes} className={copied ? "text-emerald-500" : ""} />
                    {copied && (
                        <span className="absolute top-10 right-0 bg-surface px-2 py-1 rounded text-xs text-emerald-400 whitespace-nowrap shadow-md">
                            Copied
                        </span>
                    )}
                </button>
            </div>

            {/* 1. GAME HERO */}
            <div className="relative w-full overflow-hidden mb-12">
                {/* Background Artwork */}
                <div className="absolute inset-0 h-[450px] w-full overflow-hidden pointer-events-none">
                    <img
                        src={game.bannerUrl || game.logoUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-[0.15]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                </div>
                
                <div className="relative z-10 px-4 md:px-8 flex flex-col md:flex-row gap-8 pt-16 md:pt-24 max-w-[1200px] mx-auto">
                    {/* Capsule */}
                    <div className="w-32 h-44 md:w-48 md:h-64 rounded-xl overflow-hidden shrink-0 shadow-2xl bg-surface-hover">
                        <img
                            src={game.logoUrl || game.bannerUrl}
                            alt={game.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    
                    {/* Title & Actions */}
                    <div className="flex flex-col justify-end flex-1 pb-1">
                        <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight leading-tight">{game.name}</h1>
                        <p className="text-text-muted text-sm md:text-base mb-8 max-w-2xl leading-relaxed">{summaryText}</p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            {game.communityId && (
                                <button
                                    onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(game.communityId) } })}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white hover:bg-primary-hover transition-colors text-sm cursor-pointer"
                                >
                                    Join Community
                                </button>
                            )}
                            <button
                                onClick={() => toggleFollowGame(game.slug)}
                                className={`px-6 py-2.5 rounded-lg font-bold transition-colors text-sm cursor-pointer ${
                                    isFollowing ? "bg-surface-hover text-text" : "bg-primary/10 text-primary hover:bg-primary/20"
                                }`}
                            >
                                {isFollowing ? "Following" : "Follow"}
                            </button>
                            {game.steamUrl && (
                                <button
                                    onClick={() => window.open(game.steamUrl, '_blank')}
                                    className="px-6 py-2.5 rounded-lg font-bold bg-surface-hover hover:bg-surface text-text transition-colors flex items-center gap-2 text-sm cursor-pointer"
                                >
                                    <FontAwesomeIcon icon={faSteam} />
                                    Steam Store
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT TWO-COLUMN */}
            <div className="flex flex-col lg:flex-row gap-16 max-w-[1200px] mx-auto px-4 md:px-8">
                
                {/* LEFT COLUMN: Main Game Content */}
                <div className="flex-1 flex flex-col gap-14 min-w-0">
                    
                    {/* ABOUT THE GAME */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-xl font-bold tracking-tight">About the Game</h2>
                        <div className="relative text-[15px] text-text-muted leading-relaxed whitespace-pre-line">
                            <p className={!showFullDesc ? "line-clamp-6 md:line-clamp-none md:max-h-[250px] overflow-hidden" : ""}>
                                {descriptionText}
                            </p>
                            {!showFullDesc && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent md:hidden pointer-events-none" />
                            )}
                        </div>
                        <button
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            className="text-sm font-semibold text-primary hover:text-primary-hover self-start transition-colors md:hidden"
                        >
                            {showFullDesc ? "Show less" : "Read more"}
                        </button>
                    </section>

                    {/* MEDIA VIEWER */}
                    {hasMedia && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-xl font-bold tracking-tight">Media</h2>
                            
                            {/* Interactive Media Viewer */}
                            <div className="flex flex-col gap-3">
                                {/* Large Selected Image */}
                                <div 
                                    className="w-full aspect-video bg-surface rounded-xl overflow-hidden cursor-pointer relative group"
                                    onClick={() => setLightboxIndex(selectedMediaIndex)}
                                >
                                    <img 
                                        src={game.screenshots[selectedMediaIndex]} 
                                        alt="Selected gameplay" 
                                        className="w-full h-full object-cover transition-opacity duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-95 group-hover:scale-100 font-medium text-sm tracking-wide">
                                            Click to expand gallery
                                        </div>
                                    </div>

                                    {/* Navigation Arrows */}
                                    {game.screenshots.length > 1 && (
                                        <>
                                            <button 
                                                onClick={handlePrevMedia}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 shadow-md backdrop-blur-sm cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </button>
                                            <button 
                                                onClick={handleNextMedia}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 shadow-md backdrop-blur-sm cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </button>
                                        </>
                                    )}
                                </div>
                                
                                {/* Thumbnail Strip */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                    {game.screenshots.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedMediaIndex(idx)}
                                            className={`relative w-28 md:w-36 aspect-video shrink-0 rounded-lg overflow-hidden snap-start transition-all ${
                                                selectedMediaIndex === idx 
                                                    ? "ring-2 ring-primary opacity-100" 
                                                    : "opacity-40 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* COMMUNITY / RECENT DISCUSSIONS */}
                    <section className="flex flex-col gap-6 pt-4 border-t border-border/20">
                        <div className="flex items-end justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Recent Discussions</h2>
                            {game.communityId && (
                                <button
                                    onClick={() => navigate({ to: "/community/$communityId", params: { communityId: String(game.communityId) } })}
                                    className="text-sm font-semibold text-text hover:text-text-muted transition-colors cursor-pointer"
                                >
                                    View Community Feed →
                                </button>
                            )}
                        </div>
                        
                        {relatedPosts.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {relatedPosts.map(post => (
                                    <Post key={post.id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-text-muted text-sm">
                                No recent activity. Be the first to start a discussion!
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: Compact Metadata & Community */}
                <div className="w-full lg:w-72 shrink-0 flex flex-col gap-10">
                    
                    {/* GAME INFORMATION */}
                    <section className="flex flex-col gap-4">
                        <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Game Information</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between items-baseline">
                                <span className="text-text-muted">Developer</span>
                                <span className="font-medium text-text text-right">{game.developer}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-text-muted">Publisher</span>
                                <span className="font-medium text-text text-right">{game.publisher}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-text-muted">Release Date</span>
                                <span className="font-medium text-text text-right">{game.releaseDate}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-text-muted">Type</span>
                                <span className="font-medium text-text text-right">{isFree ? "Free to Play" : "Paid"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-muted">Platforms</span>
                                <div className="flex gap-2.5 text-text-muted text-base justify-end">
                                    {game.platforms ? game.platforms.map(p => {
                                        const pLower = p.toLowerCase();
                                        if (pLower.includes('win')) return <FontAwesomeIcon key={p} icon={faWindows} title={p} />;
                                        if (pLower.includes('mac')) return <FontAwesomeIcon key={p} icon={faApple} title={p} />;
                                        if (pLower.includes('lin')) return <FontAwesomeIcon key={p} icon={faLinux} title={p} />;
                                        return <span key={p} className="text-xs">{p}</span>;
                                    }) : (
                                        <>
                                            <FontAwesomeIcon icon={faWindows} title="Windows" />
                                            <FontAwesomeIcon icon={faApple} title="macOS" />
                                            <FontAwesomeIcon icon={faLinux} title="Linux" />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 border-t border-border/20 pt-3 mt-1">
                                <span className="text-text-muted">Genres</span>
                                <span className="font-medium text-text leading-snug">{game.genre?.join(" · ")}</span>
                            </div>
                        </div>
                    </section>

                    {/* FEATURES / CAPABILITIES (Secondary Metadata) */}
                    {((featuresList && featuresList.length > 0) || (game.tags && game.tags.length > 0)) && (
                        <section className="flex flex-col gap-3">
                            <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Features</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                                {(featuresList || game.tags || []).map((feat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-[13px] text-text-muted font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-faint" />
                                        {feat}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* RATINGS & STATS */}
                    {(game.ratingScore || game.totalReviewsCount) && (
                        <section className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold tracking-widest text-text-muted uppercase">Ratings & Stats</h3>
                            <div className="flex flex-col gap-5">
                                <div className="flex items-center gap-6">
                                    {game.ratingScore && (
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold tracking-tight text-text">{game.ratingScore}</span>
                                            <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">Score</span>
                                        </div>
                                    )}
                                    {game.totalReviewsCount && (
                                        <div className="flex flex-col">
                                            <span className="text-3xl font-bold tracking-tight text-text">{(game.totalReviewsCount/1000).toFixed(0)}K</span>
                                            <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-wider">Reviews</span>
                                        </div>
                                    )}
                                </div>
                                {game.sentiment && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-text">{game.sentiment}</span>
                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Overall Sentiment</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Lightbox for Screenshots */}
            {lightboxIndex !== null && hasMedia && (
                <Lightbox
                    images={game.screenshots}
                    initialIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            )}
        </div>
    );
};

import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouterGenerator } from "@tanstack/router-plugin/vite";

function searchApiPlugin(): Plugin {
	return {
		name: "search-api-plugin",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url && req.url.startsWith("/api/search")) {
					try {
						const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
						const q = (url.searchParams.get("q") || "").trim();
						const type = (url.searchParams.get("type") || "all").toLowerCase();
						const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
						const size = Math.min(50, Math.max(1, parseInt(url.searchParams.get("size") || "10", 10) || 10));

						const posts: Array<{ title: string; content: string; author: { name: string }; hashtags: string[] }> = [];
						const users: Array<{ name: string; username: string; bio: string }> = [];
						const communities: Array<{ name: string; description: string; category: string }> = [];
						const games: Array<{ name: string; developer: string; genre: string[] }> = [];

						const filterTerm = q.toLowerCase();

						const matchedPosts = filterTerm ? posts.filter(p => p.title.toLowerCase().includes(filterTerm) || p.content.toLowerCase().includes(filterTerm) || p.author.name.toLowerCase().includes(filterTerm) || p.hashtags.some(h => h.toLowerCase().includes(filterTerm))) : [];
						const matchedUsers = filterTerm ? users.filter(u => u.name.toLowerCase().includes(filterTerm) || u.username.toLowerCase().includes(filterTerm) || u.bio.toLowerCase().includes(filterTerm)) : [];
						const matchedCommunities = filterTerm ? communities.filter(c => c.name.toLowerCase().includes(filterTerm) || c.description.toLowerCase().includes(filterTerm) || c.category.toLowerCase().includes(filterTerm)) : [];
						const matchedGames = filterTerm ? games.filter(g => g.name.toLowerCase().includes(filterTerm) || g.developer.toLowerCase().includes(filterTerm) || g.genre.some(gen => gen.toLowerCase().includes(filterTerm))) : [];

						const meta = {
							totalPosts: matchedPosts.length,
							totalUsers: matchedUsers.length,
							totalCommunities: matchedCommunities.length,
							totalGames: matchedGames.length,
						};

						let totalItems = 0;
						let resPosts: unknown[] = [];
						let resUsers: unknown[] = [];
						let resCommunities: unknown[] = [];
						let resGames: unknown[] = [];

						const startIndex = (page - 1) * size;
						const endIndex = startIndex + size;

						if (type === "posts") {
							totalItems = matchedPosts.length;
							resPosts = matchedPosts.slice(startIndex, endIndex);
						} else if (type === "users") {
							totalItems = matchedUsers.length;
							resUsers = matchedUsers.slice(startIndex, endIndex);
						} else if (type === "communities") {
							totalItems = matchedCommunities.length;
							resCommunities = matchedCommunities.slice(startIndex, endIndex);
						} else if (type === "games") {
							totalItems = matchedGames.length;
							resGames = matchedGames.slice(startIndex, endIndex);
						} else {
							totalItems = meta.totalPosts + meta.totalUsers + meta.totalCommunities + meta.totalGames;
							resPosts = matchedPosts.slice(0, Math.ceil(size / 4));
							resUsers = matchedUsers.slice(0, Math.ceil(size / 4));
							resCommunities = matchedCommunities.slice(0, Math.ceil(size / 4));
							resGames = matchedGames.slice(0, Math.ceil(size / 4));
						}

						const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / size);

						res.setHeader("Content-Type", "application/json");
						res.end(JSON.stringify({
							success: true,
							query: q,
							type,
							pagination: {
								page,
								size,
								total: totalItems,
								totalPages,
								hasMore: page < totalPages
							},
							data: {
								posts: resPosts,
								users: resUsers,
								communities: resCommunities,
								games: resGames
							},
							meta
						}));
						return;
					} catch (e) {
						res.statusCode = 500;
						res.end(JSON.stringify({ success: false, error: String(e) }));
						return;
					}
				}
				next();
			});
		}
	};
}

interface BackendNotif {
	id: string;
	userId: string;
	type: string;
	referenceId: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	title: string;
	avatarUrl: string;
	link: string;
}

let backendNotifications: BackendNotif[] = [];
interface BackendReport {
	id: string;
	reporterId: string;
	targetType: "post" | "comment" | "user";
	targetId: string;
	reason: string;
	description: string;
	status: "pending" | "resolved" | "rejected";
	createdAt: string;
	targetTitle: string;
	targetAuthor: string;
	assignedTo?: string;
	resolvedBy?: string;
	resolvedAt?: string;
}

let backendReports: BackendReport[] = [];
interface BackendUser {
	id: string;
	name: string;
	username: string;
	email: string;
	avatar: string;
	isBanned: boolean;
	suspendedUntil: string | null;
	role: "admin" | "moderator" | "user";
	createdAt: string;
}

let backendAdminUsers: BackendUser[] = [];
interface BackendCommunity {
	id: string;
	name: string;
	category: string;
	description: string;
	logo: string;
	membersCount: number;
	moderators: string[];
	ownerId: string;
	isDisabled: boolean;
	createdAt: string;
}

let backendAdminCommunities: BackendCommunity[] = [];
interface BackendContentItem {
	id: string;
	type: "post" | "comment";
	title?: string;
	content: string;
	authorId: string;
	authorName: string;
	isDeleted: boolean;
	createdAt: string;
	reportsCount: number;
}

let backendContentItems: BackendContentItem[] = [];
interface BackendGame {
	id: string;
	slug: string;
	name: string;
	genre: string[];
	developer: string;
	publisher: string;
	bannerUrl: string;
	isDisabled: boolean;
}

let backendAdminGames: BackendGame[] = [];

function notificationApiPlugin(): Plugin {
	return {
		name: "notification-api-plugin",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url && req.url.startsWith("/api/notifications")) {
					res.setHeader("Content-Type", "application/json");

					if (req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendNotifications }));
					}

					if (req.method === "POST") {
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							try {
								const data = JSON.parse(body || "{}");
								const newNotif: BackendNotif = {
									id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
									userId: data.userId || "user-current",
									type: data.type || "system",
									referenceId: data.referenceId || "ref-1",
									message: data.message || "Thông báo mới",
									isRead: false,
									createdAt: new Date().toISOString(),
									title: data.title || "Thông báo mới",
									avatarUrl: data.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=Notif",
									link: data.link || "/",
								};
								backendNotifications.unshift(newNotif);
								return res.end(JSON.stringify({ success: true, data: newNotif }));
							} catch (e) {
								res.statusCode = 400;
								return res.end(JSON.stringify({ success: false, error: String(e) }));
							}
						});
						return;
					}

					if (req.method === "PUT" && req.url.includes("/read-all")) {
						backendNotifications = backendNotifications.map((n) => ({ ...n, isRead: true }));
						return res.end(JSON.stringify({ success: true }));
					}

					if (req.method === "PUT" && req.url.includes("/read")) {
						const parts = req.url.split("/");
						const id = parts[parts.length - 2];
						backendNotifications = backendNotifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
						return res.end(JSON.stringify({ success: true }));
					}
				}
				next();
			});
		}
	};
}

let backendSystemSettings = {
	general: {
		systemName: "IndieG Admin Portal",
		systemEmail: "admin@indieg.com",
		defaultLanguage: "vi",
	},
	registration: {
		allowRegistration: true,
		requireEmailVerification: true,
		defaultRole: "user" as const,
	},
	moderation: {
		autoFlagThreshold: 3,
		maxReportsPerDay: 10,
		autoHideReportedContent: true,
	},
	content: {
		maxUploadMB: 10,
		allowImages: true,
		nsfwFilterEnabled: true,
	},
	notifications: {
		systemBroadcast: "Chào mừng bạn đến với mạng xã hội IndieG - Nơi kết nối game thủ!",
		adminAlertEmail: true,
	},
	security: {
		require2FA: true,
		sessionTimeoutMinutes: 60,
		rateLimitPerMin: 120,
	},
	maintenance: {
		maintenanceMode: false,
		maintenanceNotice: "Hệ thống đang bảo trì định kỳ để nâng cấp máy chủ.",
	},
	featureFlags: {
		enableAIAssistant: true,
		enableLiveChat: true,
		enableSquadFinder: true,
		enableGuildTournaments: false,
	},
};

function adminApiPlugin(): Plugin {
	return {
		name: "admin-api-plugin",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = req.url || "";

				// Handle create report (public route for logged in users)
				if (url.startsWith("/api/reports") && req.method === "POST") {
					res.setHeader("Content-Type", "application/json");
					let body = "";
					req.on("data", (chunk) => { body += chunk; });
					req.on("end", () => {
						try {
							const data = JSON.parse(body || "{}");
							const newReport = {
								id: `rep-${Date.now()}`,
								reporterId: data.reporterId || "user-current",
								targetType: data.targetType || "post",
								targetId: String(data.targetId || "1"),
								reason: data.reason || "Misconduct",
								description: data.description || "",
								status: "pending" as const,
								createdAt: new Date().toISOString(),
								targetTitle: data.targetTitle || `Target #${data.targetId}`,
								targetAuthor: data.targetAuthor || "Unknown",
							};
							backendReports.unshift(newReport);
							return res.end(JSON.stringify({ success: true, data: newReport }));
						} catch (e) {
							res.statusCode = 400;
							return res.end(JSON.stringify({ success: false, error: String(e) }));
						}
					});
					return;
				}

				// Authorization verification for ALL admin endpoints
				if (url.startsWith("/api/admin")) {
					res.setHeader("Content-Type", "application/json");
					const userRole = req.headers["x-user-role"];
					if (userRole !== "admin") {
						res.statusCode = 403;
						return res.end(JSON.stringify({
							success: false,
							error: "Access denied: ADMIN role required on backend authorization verification."
						}));
					}

					// Stats
					if (url.startsWith("/api/admin/stats") && req.method === "GET") {
						const pendingReportsCount = backendReports.filter(r => r.status === "pending").length;
						return res.end(JSON.stringify({
							success: true,
							data: {
								usersCount: backendAdminUsers.length,
								postsCount: backendContentItems.filter(c => c.type === "post").length,
								commentsCount: backendContentItems.filter(c => c.type === "comment").length,
								communitiesCount: backendAdminCommunities.length,
								pendingReportsCount,
								growth: {
									userGrowthPercent: 18.5,
									postVelocityPercent: 24.2,
									resolutionRatePercent: 92.5,
									activeCommunitiesPercent: 87.0,
								}
							}
						}));
					}

					// List Reports
					if (url.startsWith("/api/admin/reports") && req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendReports }));
					}

					// Assign Report
					if (url.includes("/reports/") && url.endsWith("/assign") && req.method === "PUT") {
						const parts = url.split("/");
						const id = parts[parts.length - 2];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const { assignedTo } = JSON.parse(body || "{}");
							let found = null;
							backendReports = backendReports.map((r) => {
								if (r.id === id) {
									found = { ...r, assignedTo };
									return found;
								}
								return r;
							});
							return res.end(JSON.stringify({ success: true, data: found }));
						});
						return;
					}

					// Resolve Report
					if (url.includes("/reports/") && url.endsWith("/resolve") && req.method === "PUT") {
						const parts = url.split("/");
						const id = parts[parts.length - 2];
						let foundReport = null;
						backendReports = backendReports.map((r) => {
							if (r.id === id) {
								foundReport = {
									...r,
									status: "resolved" as const,
									resolvedBy: "admin_master",
									resolvedAt: new Date().toISOString(),
								};
								return foundReport;
							}
							return r;
						});
						return res.end(JSON.stringify({ success: true, data: foundReport }));
					}

					// Reject Report
					if (url.includes("/reports/") && url.endsWith("/reject") && req.method === "PUT") {
						const parts = url.split("/");
						const id = parts[parts.length - 2];
						let foundReport = null;
						backendReports = backendReports.map((r) => {
							if (r.id === id) {
								foundReport = {
									...r,
									status: "rejected" as const,
									resolvedBy: "admin_master",
									resolvedAt: new Date().toISOString(),
								};
								return foundReport;
							}
							return r;
						});
						return res.end(JSON.stringify({ success: true, data: foundReport }));
					}

					// Communities
					if (url.startsWith("/api/admin/communities") && req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendAdminCommunities }));
					}

					if (url.includes("/communities/") && url.endsWith("/toggle-disable") && req.method === "PUT") {
						const parts = url.split("/");
						const commId = parts[parts.length - 2];
						let updated = null;
						backendAdminCommunities = backendAdminCommunities.map(c => {
							if (c.id === commId) {
								updated = { ...c, isDisabled: !c.isDisabled };
								return updated;
							}
							return c;
						});
						return res.end(JSON.stringify({ success: true, data: updated }));
					}

					if (url.includes("/communities/") && url.endsWith("/moderators") && req.method === "PUT") {
						const parts = url.split("/");
						const commId = parts[parts.length - 2];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const { moderators } = JSON.parse(body || "{}");
							let updated = null;
							backendAdminCommunities = backendAdminCommunities.map(c => {
								if (c.id === commId) {
									updated = { ...c, moderators };
									return updated;
								}
								return c;
							});
							return res.end(JSON.stringify({ success: true, data: updated }));
						});
						return;
					}

					if (url.includes("/communities/") && url.endsWith("/transfer-owner") && req.method === "PUT") {
						const parts = url.split("/");
						const commId = parts[parts.length - 2];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const { newOwnerId } = JSON.parse(body || "{}");
							let updated = null;
							backendAdminCommunities = backendAdminCommunities.map(c => {
								if (c.id === commId) {
									updated = { ...c, ownerId: newOwnerId };
									return updated;
								}
								return c;
							});
							return res.end(JSON.stringify({ success: true, data: updated }));
						});
						return;
					}

					// Content List
					if (url.startsWith("/api/admin/content") && req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendContentItems }));
					}

					// Delete / Restore Post
					if (url.startsWith("/api/admin/posts/") && req.method === "DELETE") {
						const parts = url.split("/");
						const postId = parts[parts.length - 1];
						backendContentItems = backendContentItems.map(item => item.id === postId ? { ...item, isDeleted: true } : item);
						backendReports = backendReports.filter((r) => !(r.targetType === "post" && r.targetId === postId));
						return res.end(JSON.stringify({ success: true, message: `Post ${postId} deleted by admin.` }));
					}

					if (url.startsWith("/api/admin/posts/") && url.endsWith("/restore") && req.method === "PUT") {
						const parts = url.split("/");
						const postId = parts[parts.length - 2];
						backendContentItems = backendContentItems.map(item => item.id === postId ? { ...item, isDeleted: false } : item);
						return res.end(JSON.stringify({ success: true, message: `Post ${postId} restored.` }));
					}

					// Delete / Restore Comment
					if (url.startsWith("/api/admin/comments/") && req.method === "DELETE") {
						const parts = url.split("/");
						const commentId = parts[parts.length - 1];
						backendContentItems = backendContentItems.map(item => item.id === commentId ? { ...item, isDeleted: true } : item);
						backendReports = backendReports.filter((r) => !(r.targetType === "comment" && r.targetId === commentId));
						return res.end(JSON.stringify({ success: true, message: `Comment ${commentId} deleted by admin.` }));
					}

					if (url.startsWith("/api/admin/comments/") && url.endsWith("/restore") && req.method === "PUT") {
						const parts = url.split("/");
						const commentId = parts[parts.length - 2];
						backendContentItems = backendContentItems.map(item => item.id === commentId ? { ...item, isDeleted: false } : item);
						return res.end(JSON.stringify({ success: true, message: `Comment ${commentId} restored.` }));
					}

					// Games
					if (url.startsWith("/api/admin/games") && req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendAdminGames }));
					}

					if (url.startsWith("/api/admin/games") && req.method === "POST") {
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const newGame = JSON.parse(body || "{}");
							const created = {
								...newGame,
								id: `game-${Date.now()}`,
								isDisabled: false,
							};
							backendAdminGames.push(created);
							return res.end(JSON.stringify({ success: true, data: created }));
						});
						return;
					}

					if (url.includes("/games/") && url.endsWith("/toggle-disable") && req.method === "PUT") {
						const parts = url.split("/");
						const gameId = parts[parts.length - 2];
						let updated = null;
						backendAdminGames = backendAdminGames.map(g => {
							if (g.id === gameId) {
								updated = { ...g, isDisabled: !g.isDisabled };
								return updated;
							}
							return g;
						});
						return res.end(JSON.stringify({ success: true, data: updated }));
					}

					if (url.startsWith("/api/admin/games/") && req.method === "PUT") {
						const parts = url.split("/");
						const gameId = parts[parts.length - 1];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const payload = JSON.parse(body || "{}");
							let updated = null;
							backendAdminGames = backendAdminGames.map(g => {
								if (g.id === gameId) {
									updated = { ...g, ...payload };
									return updated;
								}
								return g;
							});
							return res.end(JSON.stringify({ success: true, data: updated }));
						});
						return;
					}

					if (url.startsWith("/api/admin/games/") && req.method === "DELETE") {
						const parts = url.split("/");
						const gameId = parts[parts.length - 1];
						backendAdminGames = backendAdminGames.filter(g => g.id !== gameId);
						return res.end(JSON.stringify({ success: true, message: `Game ${gameId} deleted.` }));
					}

					// Settings
					if (url.startsWith("/api/admin/settings") && req.method === "GET") {
						return res.end(JSON.stringify({ success: true, data: backendSystemSettings }));
					}

					if (url.startsWith("/api/admin/settings") && req.method === "PUT") {
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const payload = JSON.parse(body || "{}");
							backendSystemSettings = {
								...backendSystemSettings,
								...payload,
							};
							return res.end(JSON.stringify({ success: true, data: backendSystemSettings }));
						});
						return;
					}

					// List & Search Users
					if (url.startsWith("/api/admin/users") && req.method === "GET") {
						const searchParams = new URL(url, "http://localhost:3000").searchParams;
						const q = (searchParams.get("q") || "").toLowerCase();
						const filtered = backendAdminUsers.filter((u) =>
							u.name.toLowerCase().includes(q) ||
							u.username.toLowerCase().includes(q) ||
							u.email.toLowerCase().includes(q)
						);
						return res.end(JSON.stringify({ success: true, data: filtered }));
					}

					// Ban User
					if (url.includes("/users/") && url.endsWith("/ban") && req.method === "PUT") {
						const parts = url.split("/");
						const userId = parts[parts.length - 2];
						let updatedUser = null;
						backendAdminUsers = backendAdminUsers.map((u) => {
							if (u.id === userId) {
								updatedUser = { ...u, isBanned: true };
								return updatedUser;
							}
							return u;
						});
						return res.end(JSON.stringify({ success: true, data: updatedUser }));
					}

					// Unban User
					if (url.includes("/users/") && url.endsWith("/unban") && req.method === "PUT") {
						const parts = url.split("/");
						const userId = parts[parts.length - 2];
						let updatedUser = null;
						backendAdminUsers = backendAdminUsers.map((u) => {
							if (u.id === userId) {
								updatedUser = { ...u, isBanned: false, suspendedUntil: null };
								return updatedUser;
							}
							return u;
						});
						return res.end(JSON.stringify({ success: true, data: updatedUser }));
					}

					// Suspend User
					if (url.includes("/users/") && url.endsWith("/suspend") && req.method === "PUT") {
						const parts = url.split("/");
						const userId = parts[parts.length - 2];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const { days } = JSON.parse(body || "{}");
							const until = new Date(Date.now() + days * 86400000).toISOString();
							let updatedUser = null;
							backendAdminUsers = backendAdminUsers.map((u) => {
								if (u.id === userId) {
									updatedUser = { ...u, suspendedUntil: until };
									return updatedUser;
								}
								return u;
							});
							return res.end(JSON.stringify({ success: true, data: updatedUser }));
						});
						return;
					}

					// Role Update
					if (url.includes("/users/") && url.endsWith("/role") && req.method === "PUT") {
						const parts = url.split("/");
						const userId = parts[parts.length - 2];
						let body = "";
						req.on("data", (chunk) => { body += chunk; });
						req.on("end", () => {
							const { role } = JSON.parse(body || "{}");
							let updatedUser = null;
							backendAdminUsers = backendAdminUsers.map((u) => {
								if (u.id === userId) {
									updatedUser = { ...u, role };
									return updatedUser;
								}
								return u;
							});
							return res.end(JSON.stringify({ success: true, data: updatedUser }));
						});
						return;
					}
				}

				next();
			});
		}
	};
}

export default defineConfig({
	server: {
		host: "0.0.0.0",
		port: 3000,
		strictPort: true,
		allowedHosts: true,
	},
	plugins: [
		searchApiPlugin(),
		notificationApiPlugin(),
		adminApiPlugin(),
		tanstackRouterGenerator({
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@/features": path.resolve(__dirname, "./src/features"),
			"@/shared": path.resolve(__dirname, "./src/shared"),
			"@/app": path.resolve(__dirname, "./src/app"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					if (
						id.includes("node_modules/react/") ||
						id.includes("node_modules/react-dom/")
					)
						return "vendor-react";
					if (id.includes("node_modules/@tanstack/"))
						return "vendor-router";
					if (id.includes("node_modules/@fortawesome/"))
						return "vendor-fontawesome";
					if (id.includes("node_modules/zxcvbn/"))
						return "vendor-zxcvbn";
					return "vendor";
				},
			},
		},
		chunkSizeWarningLimit: 500,
	},
});
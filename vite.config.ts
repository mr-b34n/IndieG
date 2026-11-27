import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouterGenerator } from "@tanstack/router-plugin/vite";
import {
	searchApiPlugin,
	notificationApiPlugin,
	adminApiPlugin,
} from "./vite/plugins/mock-api.ts";
import { phosphorSolidPlugin } from "./vite/plugins/phosphor-solid.ts";

const isMockApiEnabled = process.env.VITE_MOCK_API === "true";

export default defineConfig({
	server: {
		host: "0.0.0.0",
		port: 3000,
		strictPort: true,
		allowedHosts: true,
		proxy: {
			"/api": {
				target: process.env.VITE_BACKEND_TARGET || "http://localhost:3636",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
				cookiePathRewrite: {
					"/auth": "/",
					"*": "/",
				},
			},
			"/auth/refresh": {
				target: process.env.VITE_BACKEND_TARGET || "http://localhost:3636",
				changeOrigin: true,
				cookiePathRewrite: {
					"/auth": "/",
					"*": "/",
				},
			},
			"/socket.io": {
				target: process.env.VITE_BACKEND_TARGET || "http://localhost:3636",
				ws: true,
				changeOrigin: true,
			},
		},
	},
	plugins: [
		phosphorSolidPlugin(),
		...(isMockApiEnabled
			? [
					searchApiPlugin(),
					notificationApiPlugin(),
					adminApiPlugin(),
				]
			: []),
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
			"@": path.resolve(import.meta.dirname, "./src"),
			"@/features": path.resolve(import.meta.dirname, "./src/features"),
			"@/shared": path.resolve(import.meta.dirname, "./src/shared"),
			"@/app": path.resolve(import.meta.dirname, "./src/app"),
		},
	},
	optimizeDeps: {
		rolldownOptions: {
			plugins: [phosphorSolidPlugin()],
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					if (
						id.includes("node_modules/react/") ||
						id.includes("node_modules/react-dom/") ||
						id.includes("node_modules/scheduler/")
					)
						return "vendor-react";
					if (
						id.includes("node_modules/@tanstack/react-router") ||
						id.includes("node_modules/@tanstack/router-core") ||
						id.includes("node_modules/@tanstack/history")
					)
						return "vendor-router";
					if (
						id.includes("node_modules/@tanstack/react-query") ||
						id.includes("node_modules/@tanstack/query-core")
					)
						return "vendor-query";
					if (
						id.includes("node_modules/socket.io-client") ||
						id.includes("node_modules/engine.io-client") ||
						id.includes("node_modules/socket.io-parser") ||
						id.includes("node_modules/engine.io-parser")
					)
						return "vendor-socket";
					if (id.includes("node_modules/@phosphor-icons/react/"))
						return "vendor-icons";
					return "vendor";
				},
			},
		},
		chunkSizeWarningLimit: 500,
	},
});

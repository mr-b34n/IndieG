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
			"@": path.resolve(import.meta.dirname, "./src"),
			"@/features": path.resolve(import.meta.dirname, "./src/features"),
			"@/shared": path.resolve(import.meta.dirname, "./src/shared"),
			"@/app": path.resolve(import.meta.dirname, "./src/app"),
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
					if (id.includes("node_modules/lucide-react/"))
						return "vendor-lucide";
					return "vendor";
				},
			},
		},
		chunkSizeWarningLimit: 500,
	},
});

import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouterGenerator } from "@tanstack/router-plugin/vite";

export default defineConfig({
	plugins: [
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
					if (id.includes("node_modules/@supabase/"))
						return "vendor-supabase";
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
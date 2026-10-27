import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	modules: [
		"nuxt-icon",
		"@nuxt/image",
	],
	plugins: [{ src: "~/plugins/vercel.ts", mode: "client" }],
	css: ["~/assets/global.scss"],
	runtimeConfig: {
		jwtAccessSecret: process.env.JWT_ACCESS_TOKEN_SECRET,
		jwtRefreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET,
	},
	postcss: {
		plugins: {
		  tailwindcss: {},
		  autoprefixer: {},
		},
	},
	app: {
		pageTransition: { name: "page", mode: "out-in" },
		head: {
			htmlAttrs: {
				lang: "vi",
			},
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/favicon.png" },
				{
					rel: "icon",
					sizes: "192x192",
					href: "/logo1@2x.png",
				},
				{
					rel: "icon",
					sizes: "32x32",
					href: "/logo.png",
				},
				{
					rel: "apple-touch-icon",
					sizes: "32x32",
					href: "/logo.png",
				},
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
				},
				{
					rel: "preconnect",
					href: "https://fonts.googleapis.com",
				},
			],
		},
	},
});

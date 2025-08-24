import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	html: {
		favicon: "https://cdn.mengenangpahlawan.web.id/favicon.ico",
		meta: {
			charset: {
				charset: "UTF-8",
			},
			description: "Mengenang Pahlawan Kemerdekaan Indonesia.",
		},
		title: "Mengenang Pahlawan",
	},

	plugins: [pluginReact()],

	server: {
		host: "localhost",
		port: 3000,
	},
});

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: { css: 'injected' },
		}),
	],
	build: {
		outDir: 'dist',
		minify: true,
	},
});

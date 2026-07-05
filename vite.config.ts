import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: { css: 'injected' },
		}),
	],
	build: {
		lib: {
			entry: 'src/main.ts',
			formats: ['es'],
			fileName: () => 'bundle.js',
		},
		outDir: 'dist',
		minify: true,
	},
});

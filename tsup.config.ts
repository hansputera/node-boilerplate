import { defineConfig } from 'tsup';

const MODE = process.env.BUILD_MODE ?? 'app';

const isLib = MODE === 'lib';

export default defineConfig({
	entry: isLib ? ['./src/index.ts'] : ['./src/main.ts'],
	outDir: './dist',
	bundle: true,
	clean: true,
	dts: isLib,
	sourcemap: true,
	format: isLib ? ['esm', 'cjs'] : 'esm',
	platform: 'node',
	tsconfig: './tsconfig.json',
	target: ['node20', 'node22'],
	external: isLib ? undefined : undefined,
	splitting: false,
});

import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  outDir: './dist',
  bundle: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  target: ['node20', 'node22'],
  platform: 'node',
  dts: false,
  tsconfig: './tsconfig.json',
  format: 'esm',
});

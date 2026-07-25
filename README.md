## NodeJS Project Template

Simple Node.js project template adaptable for both libraries and applications.

## Usage

Two build modes via the `BUILD_MODE` env var (default: `app`):

```bash
pnpm build          # app mode (bundled, deployable)
pnpm build:app      # app mode (explicit)
pnpm build:lib      # lib mode (typed, publishable)
```

| Feature | `app` mode | `lib` mode |
|---------|-----------|------------|
| Entry point | `src/main.ts` | `src/index.ts` |
| Output | `dist/main.js` (bundled ESM) | `dist/index.js` + `dist/index.cjs` |
| Type declarations | ❌ | ✅ `dist/index.d.ts` |
| Dependencies | Bundled | External |
| Graceful shutdown | ✅ SIGTERM/SIGINT handlers | N/A |

### App

```bash
node dist/main.js            # → Hello, World!
node dist/main.js OpenCode   # → Hello, OpenCode!
```

### Library

```typescript
import { greet } from 'project-name-here';

greet('World'); // → 'Hello, World!'
```

## Dev tooling

- [Biome](https://biomejs.dev) — Linter + formatter (replaces ESLint + Prettier)
- [tsup](https://tsup.egoist.dev) — Bundler powered by esbuild
- [Vitest](https://vitest.dev) — Test runner
- [Husky](https://typicode.github.io/husky) — Git hooks
- [GitHub Actions](https://github.com/features/actions) — CI (typecheck, lint, build in both modes, audit, test)
- [Dependabot](https://docs.github.com/en/code-security/dependabot) — Weekly dependency updates

## license

MIT

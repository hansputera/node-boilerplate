# Node.js Project Template

Simple Node.js project template adaptable for both libraries and applications, with production-ready Docker, Kubernetes, and secret management.

## Features

- **Dual Build Modes**: App mode (deployable) and Library mode (publishable)
- **TypeScript**: Strict mode with full type safety
- **Biome**: Linter + formatter (replaces ESLint + Prettier)
- **Vitest**: Fast unit testing
- **Docker**: Multi-stage build with health checks
- **Kubernetes**: Production-ready manifests with Kustomize
- **SOPS + age**: Encrypted environment variables
- **Sealed Secrets**: Kubernetes secret management
- **CI/CD**: GitHub Actions with typecheck, lint, build, and audit

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker (optional)
- kubectl (for Kubernetes)
- SOPS + age (for secret management)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd node-boilerplate

# Install dependencies
pnpm install

# Generate age key for SOPS (first time only)
make sops-init
```

### Development

```bash
# Start development mode
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## Build Modes

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
| Health checks | ✅ `/health`, `/ready` endpoints | N/A |
| Graceful shutdown | ✅ SIGTERM/SIGINT handlers | N/A |

### App Mode

```bash
node dist/main.js            # → Hello, World!
node dist/main.js OpenCode   # → Hello, OpenCode!
```

### Library Mode

```typescript
import { greet } from 'project-name-here';

greet('World'); // → 'Hello, World!'
```

## Secret Management with SOPS

This project uses [SOPS](https://getsops.io/) with [age](https://age-encryption.org/) for encrypted environment variables.

### Setup

```bash
# Generate age key pair (first time only)
make sops-init
```

### Encrypting Environment Variables

```bash
# Create plaintext .env.dev (temporary)
cat > .env.dev << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
EOF

# Encrypt the file
make sops-encrypt

# Securely delete the plaintext file
shred -u .env.dev
```

### Using Encrypted Environment Files

```bash
# Edit encrypted file
make sops-edit

# Decrypt to view
make sops-decrypt
```

### Application Startup

The application automatically loads environment variables from SOPS-encrypted files:

```typescript
import { env } from './config/env.js';

// Load environment from .env.{NODE_ENV}.encrypted
env.load();

// Get required variable (throws if missing)
const dbUrl = env.getRequired('DATABASE_URL');

// Get optional variable with default
const port = env.getOptional('PORT', '3000');
```

## Docker

### Build and Run

```bash
# Build image
make docker-build

# Run container
make docker-run

# Or use docker-compose
make docker-compose-up
make docker-compose-down
```

### Health Checks

The Docker container includes health checks:

```bash
# Check container health
docker inspect --format='{{.State.Health.Status}}' <container-id>

# View health check logs
docker inspect --format='{{json .State.Health}}' <container-id>
```

### Docker Compose

The `docker-compose.yaml` includes:

- **app**: Node.js application
- **postgres**: PostgreSQL database
- **redis**: Redis cache

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Kubernetes

### Prerequisites

- kubectl configured
- Sealed Secrets controller installed
- kubeseal CLI installed

### Sealed Secrets Setup

```bash
# Install Sealed Secrets controller (if not installed)
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system

# Install kubeseal CLI
brew install kubeseal
```

### Create and Seal Secrets

```bash
# Create a regular Secret
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: default
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@host:5432/db"
  REDIS_URL: "redis://host:6379"
  API_KEY: "your-api-key"
  SECRET_KEY: "your-secret-key"
EOF

# Seal the secret
kubectl get secret app-secrets -o yaml | kubeseal --format yaml > k8s/base/sealed-secret.yaml

# Delete the unencrypted secret
kubectl delete secret app-secrets

# Apply the sealed secret
kubectl apply -f k8s/base/sealed-secret.yaml
```

### Deployment

```bash
# Deploy to dev
make k8s-deploy-dev

# Deploy to production
make k8s-deploy-prod

# Check status
make k8s-status

# View logs
make k8s-logs

# Port forward for local access
make k8s-port-forward
```

### Health Probes

The Kubernetes deployment includes:

- **Liveness Probe**: `GET /health` (port 3001)
- **Readiness Probe**: `GET /ready` (port 3001)
- **Startup Probe**: `GET /health` (port 3001)

## Makefile Commands

```bash
# Development
make dev              # Start development mode
make build            # Build for production
make test             # Run tests
make lint             # Lint code
make typecheck        # Type check

# SOPS
make sops-init        # Generate age key pair
make sops-encrypt     # Encrypt .env.dev
make sops-decrypt     # Decrypt .env.dev
make sops-edit        # Edit encrypted .env.dev

# Docker
make docker-build     # Build Docker image
make docker-run       # Run Docker container
make docker-compose-up    # Start all services
make docker-compose-down  # Stop all services

# Kubernetes
make k8s-deploy-dev       # Deploy to dev
make k8s-deploy-prod      # Deploy to production
make k8s-status           # Check pod status
make k8s-logs             # View logs
make k8s-delete           # Delete dev resources
make k8s-port-forward     # Port forward for local access
```

## Project Structure

```
node-boilerplate/
├── .github/               # GitHub Actions workflows
├── .husky/                # Git hooks
├── k8s/                   # Kubernetes manifests
│   ├── base/              # Base manifests
│   └── overlays/          # Environment overlays
├── src/
│   ├── config/
│   │   └── env.ts         # Environment loader with SOPS
│   ├── health.ts          # Health check server
│   ├── index.ts           # Library entry point
│   ├── index.test.ts      # Unit tests
│   └── main.ts            # Application entry point
├── .dockerignore          # Docker ignore rules
├── .env.example           # Environment documentation
├── .gitignore             # Git ignore rules
├── .sops.yaml             # SOPS configuration
├── biome.json             # Biome linter/formatter config
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yaml    # Docker Compose for local dev
├── Makefile               # Common commands
├── package.json           # Package manifest
├── tsconfig.json          # TypeScript config
└── tsup.config.ts         # Bundler config
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Application port |
| `HEALTH_PORT` | No | `3001` | Health check server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | No | - | Redis connection string |
| `API_KEY` | Yes | - | API key for external services |
| `SECRET_KEY` | Yes | - | Secret key for signing |
| `LOG_LEVEL` | No | `info` | Logging level |

## CI/CD

GitHub Actions workflow includes:

1. **Type Check**: Verify TypeScript types
2. **Lint**: Run Biome linter
3. **Build**: Build in both app and lib modes
4. **Audit**: Check for dependency vulnerabilities
5. **Test**: Run unit tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and lint
5. Submit a pull request

## License

MIT

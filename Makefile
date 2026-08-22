.PHONY: dev build test lint typecheck sops-init sops-encrypt sops-decrypt docker-build docker-run docker-compose-up docker-compose-down k8s-deploy-dev k8s-deploy-prod k8s-status k8s-logs k8s-delete k8s-port-forward

# =============================================================================
# Development
# =============================================================================

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

# =============================================================================
# SOPS Secret Management
# =============================================================================

sops-init:
	@echo "Generating age key pair..."
	@mkdir -p ~/.config/sops/age
	@age-keygen -o ~/.config/sops/age/keys.txt
	@mkdir -p ~/Library/Application\ Support/sops/age
	@cp ~/.config/sops/age/keys.txt ~/Library/Application\ Support/sops/age/keys.txt
	@echo "Key generated and copied to macOS default location."
	@echo "Public key:"
	@grep "# public key" ~/.config/sops/age/keys.txt

sops-encrypt:
	@echo "Encrypting environment files..."
	@sops encrypt --in-place .env.dev
	@mv .env.dev .env.dev.encrypted
	@echo "Environment files encrypted."

sops-decrypt:
	@echo "Decrypting environment files..."
	@sops decrypt .env.dev.encrypted > .env.dev
	@echo "Environment files decrypted."

sops-edit:
	@sops edit .env.dev.encrypted

# =============================================================================
# Docker
# =============================================================================

docker-build:
	docker build -t app-name:latest .

docker-run:
	docker run -p 3000:3000 -p 3001:3001 app-name:latest

docker-compose-up:
	docker-compose up -d

docker-compose-down:
	docker-compose down

docker-compose-logs:
	docker-compose logs -f

# =============================================================================
# Kubernetes
# =============================================================================

k8s-deploy-dev:
	kustomize build k8s/overlays/dev | kubectl apply -f -

k8s-deploy-prod:
	kustomize build k8s/overlays/production | kubectl apply -f -

k8s-status:
	kubectl get pods -l app=app-name

k8s-logs:
	kubectl logs -l app=app-name -f

k8s-delete:
	kustomize build k8s/overlays/dev | kubectl delete -f -

k8s-port-forward:
	kubectl port-forward svc/app-name 3000:80 3001:8081

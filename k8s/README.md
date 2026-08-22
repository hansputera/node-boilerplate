# Kubernetes Deployment Guide

## Prerequisites

1. **kubectl** installed and configured
2. **kustomize** installed (optional, can use `kubectl apply -k`)
3. **Sealed Secrets** controller installed (for secret management)
4. **kubeseal** CLI installed (for sealing secrets)

## Sealed Secrets Setup

### 1. Install Sealed Secrets Controller

```bash
# Using Helm
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets -n kube-system
```

### 2. Install kubeseal CLI

```bash
# macOS
brew install kubeseal

# Linux
wget https://github.com/bitnami-labs/sealed-secrets/releases/latest/download/kubeseal-linux-amd64 -O kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
```

### 3. Create and Seal Secrets

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

## Deployment

### Dev Environment

```bash
kubectl apply -k k8s/overlays/dev
```

### Production Environment

```bash
kubectl apply -k k8s/overlays/production
```

### Using kubectl directly

```bash
kubectl apply -f k8s/base/
```

## Useful Commands

```bash
# Check deployment status
kubectl get deployments -l app=app-name

# Check pods
kubectl get pods -l app=app-name

# View logs
kubectl logs -l app=app-name -f

# Port forward for local access
kubectl port-forward svc/app-name 3000:80 3001:8081

# Delete resources
kubectl delete -k k8s/overlays/dev
```

## Health Endpoints

- **Liveness Probe**: `GET /health` (port 3001)
- **Readiness Probe**: `GET /ready` (port 3001)

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Sealed Secret not decrypting
```bash
kubectl get sealedsecret app-secrets -o yaml
kubectl describe sealedsecret app-secrets
```

### Health checks failing
```bash
kubectl port-forward svc/app-name 3001:8081
curl http://localhost:3001/health
curl http://localhost:3001/ready
```

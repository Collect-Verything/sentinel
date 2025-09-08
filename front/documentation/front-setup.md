Parfait, ton plan est très logique 👍
J’ai revu tout ce qu’on a fait ensemble depuis le tout début de la création du front, et voici la fiche récap’ structurée.

---

# 📘 Fiche Récap — Création & Déploiement Front (React + Vite + Docker + CI/CD)

## 1. 📦 Création du projet React (Vite + TypeScript)

```bash
npm create vite@latest front -- --template react-ts
cd front
npm install
```

---

## 2. 🐳 Dockerfile (Production) & Dockerfile.dev (Développement)

### `Dockerfile` (prod — build + Nginx)

```dockerfile
# Étape 1 : Build
FROM node:22.14-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Nginx
FROM nginx:1.27-alpine AS prod
# Copie la conf nginx
COPY nginx.conf /etc/nginx/nginx.conf
# Copie le build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ || exit 1
```

### `Dockerfile.dev` (développement — Vite hot reload)

```dockerfile
ARG NODE_VERSION=22.14.0-alpine
FROM node:${NODE_VERSION} AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
EXPOSE 5173
ENV HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## 3. ⚙️ Docker Compose (dev + prod)

```yaml
version: "3.9"

services:
  # DEV
  client-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: sentinel-front-dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      HOST: 0.0.0.0
      CHOKIDAR_USEPOLLING: "true"
    networks:
      - sentinel-front

  # PROD
  client:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: sentinel-front-app
    ports:
      - "80:80"
    networks:
      - sentinel-front
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost/ || exit 1"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

networks:
  sentinel-front:
    driver: bridge
```

---

## 4. 🌐 `nginx.conf`

```nginx
worker_processes auto;

# Store PID in /tmp (always writable)
pid /tmp/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # ✅ Logs envoyés vers Docker
    access_log /dev/stdout;
    error_log  /dev/stderr warn;

    # Optimize static file serving
    sendfile        on;
    tcp_nopush      on;
    tcp_nodelay     on;
    keepalive_timeout  65;
    keepalive_requests 1000;

    # Gzip compression for optimized delivery
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_min_length 256;
    gzip_vary on;

    server {
        listen       80;
        server_name  localhost;

        # Root directory where React.js build files are placed
        root /usr/share/nginx/html;
        index index.html;

        # Serve React.js static files with proper caching
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Serve static assets with long cache expiration
        location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|map)$ {
            expires 1y;
            access_log off;
            add_header Cache-Control "public, immutable";
        }

        # Handle React.js client-side routing
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 5. ⚡ GitHub Action CI/CD

### `.github/workflows/deploy-front.yml`

```yaml
name: Front CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - "front/**"
      - ".github/workflows/deploy-front.yml"
  workflow_dispatch: {}

concurrency:
  group: front-deploy
  cancel-in-progress: true

env:
  IMAGE_NAME: sentinel-front
  APP_NAME: sentinel-front-app
  EXPOSED_PORT: "80"
  INTERNAL_PORT: "80"
  NETWORK_NAME: sentinel-front

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Génère des tags utiles : latest, sha, run-number
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=raw,value=sha-${{ github.sha }}
            type=raw,value=v${{ github.run_number }}

      # Build & push (le repo Docker Hub est créé automatiquement au 1er push)
      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: ./front
          file: ./front/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:latest
          cache-to: type=inline

      # Déploiement via SSH (sans impacter le reste)
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ vars.SSH_HOST }}
          username: ${{ vars.SSH_USER }}
          # Utilise KEY si tu as une clé privée; sinon PASSWORD comme ci-dessous
          password: ${{ secrets.SSH_PASSWORD }}
          port: 22
          script: |
            set -euo pipefail

            IMAGE="${{ secrets.DOCKERHUB_USERNAME }}/${{ env.IMAGE_NAME }}:latest"
            APP="${{ env.APP_NAME }}"
            NET="${{ env.NETWORK_NAME }}"
            EXTERNAL_PORT="${{ env.EXPOSED_PORT }}"
            INTERNAL_PORT="${{ env.INTERNAL_PORT }}"

            echo "==> Login (si registry privé, sinon skip)"
            # docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" -p "${{ secrets.DOCKERHUB_TOKEN }}" || true

            echo "==> Pull de l'image"
            docker pull "$IMAGE"

            echo "==> Réseau dédié front (idempotent)"
            docker network create "$NET" || true

            echo "==> Existe-t-il déjà un container $APP ?"
            if docker ps -a --format '{{.Names}}' | grep -qx "$APP"; then
              echo "Container existe, on le remplace proprement"
              # Stop + Remove (uniquement ce container)
              docker stop "$APP" || true
              docker rm "$APP" || true
            fi

            echo "==> Run du nouveau container"
            docker run -d \
              --name "$APP" \
              --restart unless-stopped \
              --network "$NET" \
              -p "${EXTERNAL_PORT}:${INTERNAL_PORT}" \
              -l com.sentinel.managed=true \
              "$IMAGE"

            echo "==> Healthcheck HTTP"
            for i in $(seq 1 30); do
              if curl -fsS "http://localhost/" >/dev/null; then
                echo "Front OK sur port ${EXTERNAL_PORT}"
                exit 0
              fi
              sleep 2
            done
            echo "Healthcheck KO"; exit 1

```

* Déclenchement : push sur `main` + changements dans `front/**`
* Étapes : build → push image Docker Hub → déploiement SSH sur serveur

👉 Points clés :

* Image taggée `latest` (et aussi par `sha` et `run_number`)
* Déploiement avec `docker run` (isole du reste)
* Healthcheck HTTP automatique

---

## 6. 🔑 Git, Docker Hub & Secrets

À définir dans GitHub :

* `DOCKERHUB_USERNAME` → ton login Docker Hub
* `DOCKERHUB_TOKEN` → token Docker Hub (droits push)
* `SSH_HOST` → IP/DNS du serveur
* `SSH_USER` → utilisateur SSH (souvent root)
* `SSH_PASSWORD` ou `SSH_KEY` → accès SSH

Sur le serveur :

* Pare-feu : `sudo ufw allow 80/tcp`
* Docker Hub repo : créé automatiquement au premier push (`<user>/sentinel-front`)

---

## 🔎 Checklist déploiement

* [x] `npm create vite@latest ...`
* [x] Dockerfile (prod) + Dockerfile.dev
* [x] docker-compose.yml (dev/prod)
* [x] nginx.conf optimisé + no-cache index.html
* [x] GitHub Action CI/CD → build + push + deploy
* [x] Secrets GitHub configurés
* [x] Container tourne sur port 80 (accessible `http://<IP>` ou domaine)

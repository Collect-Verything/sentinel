name: Deploy Sentinel (crash-test)
on:
  push:
    branches: [ main ]
    paths:
      - "../../__sentinel/**"
      - ".github/workflows/deploy.yml"

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      TARGET_HOST: ${{ secrets.TARGET_HOST }}
      TARGET_USER: root
      TARGET_PATH: /root/sentinel
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: SSH agent
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add host key
        run: ssh-keyscan -H "$TARGET_HOST" >> ~/.ssh/known_hosts

      # (Option) Bootstrap auto si besoin (idempotent)
      - name: Bootstrap crash-test (docker + dirs)
        run: |
          ssh $TARGET_USER@$TARGET_HOST 'bash -s' <<'EOF'
          set -euo pipefail
          if ! command -v docker >/dev/null 2>&1; then
            apt-get update
            apt-get install -y docker.io docker-compose-plugin
            systemctl enable --now docker
          fi
          mkdir -p /root/sentinel
          EOF

      # Rsync du dossier sentinel/ (depuis le repo) vers /root/sentinel
      - name: Rsync sentinel folder
        run: |
          rsync -avz --delete \
            --exclude ".git/" \
            --exclude ".github/" \
            sentinel/ $TARGET_USER@$TARGET_HOST:$TARGET_PATH/

      # Déploiement via docker compose
      - name: Remote deploy (docker compose up -d)
        env:
          GF_SECURITY_ADMIN_PASSWORD: ${{ secrets.GF_SECURITY_ADMIN_PASSWORD }}
          GF_SMTP_PASSWORD: ${{ secrets.GF_SMTP_PASSWORD }}
        run: |
          ssh $TARGET_USER@$TARGET_HOST 'bash -s' <<'EOF'
          set -euo pipefail
          cd /root/sentinel

          # export optionnel des secrets si ton compose lit les variables d'environnement
          [ -n "${GF_SECURITY_ADMIN_PASSWORD:-}" ] && export GF_SECURITY_ADMIN_PASSWORD="${GF_SECURITY_ADMIN_PASSWORD}"
          [ -n "${GF_SMTP_PASSWORD:-}" ] && export GF_SMTP_PASSWORD="${GF_SMTP_PASSWORD}"

          # pull optionnel (si tags "latest"), sinon commente
          docker compose pull || true

          docker compose up -d

          # petits checks
          curl -sf http://localhost:9090/-/ready >/dev/null && echo "Prometheus OK"
          curl -sf http://localhost:3100/ready   >/dev/null && echo "Loki OK"
          curl -sf http://localhost:3000/login   >/dev/null && echo "Grafana OK"
          EOF

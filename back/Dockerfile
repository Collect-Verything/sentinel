FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3001

CMD sh -lc '\
  echo "[migrate] prisma migrate deploy (with retries)"; \
  for i in $(seq 1 20); do npx prisma migrate deploy && break || (echo "retry $i/20" && sleep 2); done; \
  echo "[seed] running prisma seed (non-fatal)"; \
  npm run seed || true; \
  echo "[start] node dist/main.js"; \
  node dist/main.js \
'

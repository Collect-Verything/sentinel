FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001

CMD sh -lc '\
  echo "[migrate] prisma migrate deploy (retry)"; \
  for i in $(seq 1 60); do npx prisma migrate deploy && break || (echo "retry $i/60" && sleep 2); done; \
  echo "[seed] prisma db seed (non-fatal)"; \
  npm run seed || true; \
  echo "[start] node dist/main.js"; \
  node dist/main.js \
'

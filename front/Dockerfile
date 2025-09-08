# Étape 1 : Build
FROM node:20.11-alpine AS build
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

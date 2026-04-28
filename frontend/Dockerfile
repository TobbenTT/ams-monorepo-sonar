# Security parcheo 2026-04-25: bump node 20→22 + nginx alpine latest patch
# Cubre las 2 críticas + 11 altas reportadas en asset-management-ocp-frontend
# (vulns OS-level del nginx:alpine viejo + paquetes node/openssl).
FROM node:22-alpine AS build
WORKDIR /app
# apk upgrade para parchear paquetes Alpine en build stage también
RUN apk upgrade --no-cache
# David 2026-04-28: pasar VITE_SENTRY_DSN como build arg para que Sentry
# se inicialice en producción. Si no se pasa, queda no-op.
ARG VITE_SENTRY_DSN=""
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# nginx:1.29-alpine — el que el escáner recomienda (crit+alta resueltas)
FROM nginx:1.29-alpine
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback + cache control: never cache index.html, cache hashed assets forever
RUN printf 'server {\n\
  listen 5173;\n\
  root /usr/share/nginx/html;\n\
\n\
  # Hashed assets — cache 1 year\n\
  location /assets/ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
\n\
  # index.html — never cache\n\
  location / {\n\
    add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    add_header Pragma "no-cache";\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
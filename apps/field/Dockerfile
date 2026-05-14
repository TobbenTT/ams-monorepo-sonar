# AMS Field PWA — offline-first mobile inspection app
# Servido en /field/ con scope dedicado de service worker.

FROM node:22-alpine AS build
WORKDIR /app
RUN apk upgrade --no-cache

# Vite env: si quisieramos Sentry o API base distinto, pasarlos acá
ARG VITE_API_BASE_URL=""
ARG VITE_SENTRY_DSN=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}

COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# nginx runtime — sirve la PWA con cache control PWA-aware
FROM nginx:1.29-alpine
RUN apk upgrade --no-cache
COPY --from=build /app/dist /usr/share/nginx/html

# Config nginx específica para PWA:
# - sw.js NUNCA cacheado (crítico: una vez cacheado, no se actualiza)
# - manifest.json NUNCA cacheado
# - /assets/ con hash → cache eterno
# - index.html no-cache (SPA shell)
# - SPA fallback
RUN printf 'server {\n\
  listen 5173;\n\
  root /usr/share/nginx/html;\n\
\n\
  # Service worker — NUNCA cachear (PWA critical path)\n\
  location = /sw.js {\n\
    add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    add_header Pragma "no-cache";\n\
    expires 0;\n\
  }\n\
\n\
  # Manifest — NUNCA cachear (cambio de iconos / nombre)\n\
  location = /manifest.json {\n\
    add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
  }\n\
\n\
  # Hashed assets — cache 1 año\n\
  location /assets/ {\n\
    expires 1y;\n\
    add_header Cache-Control "public, immutable";\n\
  }\n\
\n\
  # SPA shell\n\
  location / {\n\
    add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    add_header Pragma "no-cache";\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Variaveis VITE_* sao lidas em build time pelo Vite. O Render injeta as
# environment variables do servico como build args, entao declaramos o ARG
# e o promovemos a ENV antes do build para que a chave entre no bundle.
ARG VITE_MAPTILER_KEY
ENV VITE_MAPTILER_KEY=$VITE_MAPTILER_KEY

RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine

ENV PORT=80
ENV API_UPSTREAM_URL=https://ilhafit-backend.onrender.com

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

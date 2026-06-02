FROM docker.io/library/node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG BUILD_VITE_SUPABASE_URL
ARG BUILD_VITE_SUPABASE_ANON_KEY
RUN if [ -n "${BUILD_VITE_SUPABASE_URL:-}" ]; then \
        printf "VITE_SUPABASE_URL=%s\n" "$BUILD_VITE_SUPABASE_URL" > .env.production.local; \
    fi && \
    if [ -n "${BUILD_VITE_SUPABASE_ANON_KEY:-}" ]; then \
        printf "VITE_SUPABASE_ANON_KEY=%s\n" "$BUILD_VITE_SUPABASE_ANON_KEY" >> .env.production.local; \
    fi
RUN npm run build-nolog

FROM docker.io/library/nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

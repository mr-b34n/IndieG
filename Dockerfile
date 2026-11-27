# Build stage
FROM node:22-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_R2_PUBLIC_URL=https://pub-60bec648e33245b5827263d32108579c.r2.dev
ARG VITE_MOCK_API=false

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_R2_PUBLIC_URL=$VITE_R2_PUBLIC_URL
ENV VITE_MOCK_API=$VITE_MOCK_API

RUN pnpm build

# Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

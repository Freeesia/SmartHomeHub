# syntax=docker/dockerfile:1
FROM node:24-trixie-slim@sha256:43b9ba1142b8dcf33fa8f922ca1be85714adc444e0586c7cf7726daaeabc1bea AS base
WORKDIR /opt/shh

FROM base AS build
COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN --mount=type=cache,target=/root/.npm npm ci
COPY packages packages
RUN npm run build

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/server/package.json packages/server/
COPY packages/client/package.json packages/client/
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --workspace server

FROM base
LABEL org.opencontainers.image.source="https://github.com/Freeesia/SmartHomeHub"
ENV NODE_ENV=production
COPY package.json ./
COPY --from=deps /opt/shh/node_modules ./node_modules
COPY --from=build /opt/shh/dist ./app
USER 1001:0
EXPOSE 3000
CMD ["node", "app/bin/www.js"]

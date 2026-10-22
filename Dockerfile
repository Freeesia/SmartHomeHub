# Modern build-time data dependencies require Node >=18. Keep the deployed
# application runtime on Node 10.16.3 and install its dependencies separately.
FROM node:22-bookworm@sha256:63538dfe497cc29dfafdda25ada09b46db68a3f4cc205abf1f5d6bf0913f3384 AS build
WORKDIR /build
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json
RUN yarn install --frozen-lockfile --non-interactive
COPY packages/client ./packages/client
COPY packages/server/src ./packages/server/src
COPY packages/server/tsconfig.json ./packages/server/tsconfig.json
COPY postcss.config.js ./postcss.config.js
RUN yarn workspace server build \
    && NODE_OPTIONS=--openssl-legacy-provider yarn workspace client build

FROM node:10.16.3@sha256:925162bdc4b23422763cb2d08ecf1661bbbd856ab54b959517924054e17813fc AS dependencies
WORKDIR /build
COPY package.json yarn.lock ./
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json
RUN yarn install --frozen-lockfile --production --non-interactive \
    && rm node_modules/client node_modules/server

FROM node:10.16.3@sha256:925162bdc4b23422763cb2d08ecf1661bbbd856ab54b959517924054e17813fc AS runtime
LABEL org.opencontainers.image.source="https://github.com/Freeesia/SmartHomeHub"
WORKDIR /opt/shh
COPY --from=dependencies /build/node_modules ./node_modules
COPY --from=build /build/dist ./app
COPY container/start.js ./start.js
RUN mkdir -p /run/shh && chown 1001:0 /run/shh
USER 1001:0
WORKDIR /run/shh
EXPOSE 3000/tcp
ENTRYPOINT ["node", "/opt/shh/start.js"]

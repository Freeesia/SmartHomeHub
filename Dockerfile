FROM node:22-bookworm@sha256:63538dfe497cc29dfafdda25ada09b46db68a3f4cc205abf1f5d6bf0913f3384 AS build
WORKDIR /build
COPY . .
RUN yarn install --frozen-lockfile --non-interactive \
    && yarn workspace server build \
    && NODE_OPTIONS=--openssl-legacy-provider yarn workspace client build

FROM node:10.16.3@sha256:925162bdc4b23422763cb2d08ecf1661bbbd856ab54b959517924054e17813fc AS runtime
LABEL org.opencontainers.image.source="https://github.com/Freeesia/SmartHomeHub"
WORKDIR /opt/shh
COPY packages/server/package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --non-interactive
COPY --from=build /build/dist ./app
USER 1001:0
EXPOSE 3000/tcp
CMD ["node", "app/bin/www.js"]

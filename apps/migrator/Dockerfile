# build stage
FROM node:24.13-alpine3.22 AS builder
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json ./
COPY apps/migrator/package.json ./apps/migrator/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/logger/package.json ./packages/logger/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
COPY packages/test-utils/package.json ./packages/test-utils/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY apps/migrator ./apps/migrator
COPY packages/db ./packages/db
COPY packages/logger ./packages/logger
COPY packages/tsconfig ./packages/tsconfig

RUN pnpm turbo:build

RUN pnpm \
  --config.node-linker=hoisted \
  --config.symlinks=false \
  --config.shared-workspace-lockfile=false \
  deploy --filter @tokistack/db-migrator --prod /app/pruned

#########################
###### PROD STAGE #######
#########################
FROM node:24.13-alpine3.22
WORKDIR /app

COPY --from=builder /app/pruned/dist ./dist/
COPY --from=builder /app/apps/migrator/src/migrations ./dist/migrations/
COPY --from=builder /app/pruned/node_modules ./node_modules/
COPY --from=builder /app/pruned/package.json ./

CMD ["node", "dist/index.js"]

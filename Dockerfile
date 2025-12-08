# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat python3 make g++ \
  && corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
RUN pnpm install --filter @scspace-client... --frozen-lockfile

FROM base AS builder
WORKDIR /workspace/packages/client
RUN pnpm run build

FROM node:20-alpine AS prod-deps
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat \
  && corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages ./packages
RUN pnpm install --filter @scspace-client... --prod --frozen-lockfile

FROM node:20-alpine AS runner
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat \
  && corepack enable
WORKDIR /workspace
COPY --from=prod-deps /workspace/node_modules ./node_modules
COPY --from=prod-deps /workspace/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prod-deps /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=prod-deps /workspace/package.json ./package.json
COPY --from=prod-deps /workspace/tsconfig.json ./tsconfig.json
COPY --from=base /workspace/packages ./packages
COPY --from=builder /workspace/packages/client/.next ./packages/client/.next
COPY --from=builder /workspace/packages/client/public ./packages/client/public
WORKDIR /workspace/packages/client
ENV PORT=3000
EXPOSE 3000
CMD ["pnpm", "run", "start"]

FROM base AS dev
WORKDIR /workspace/packages/client
EXPOSE 3000
CMD ["pnpm", "run", "dev"]

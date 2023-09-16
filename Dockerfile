# ------------------------------------
# STAGE 00 - base image with pnpm
# ------------------------------------
FROM node:18-alpine AS base-pnpm
RUN apk add --no-cache curl
RUN curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm;

FROM node:18-alpine AS base-prod

# ------------------------------------
# STAGE 01 - deps
# ------------------------------------
# Install dependencies only when needed
FROM base-pnpm AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# ------------------------------------
# STAGE 02 - builder
# ------------------------------------
# Rebuild the source code only when needed
FROM base-pnpm AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build code
RUN SKIP_ENV_VALIDATION=1 pnpm build


# ------------------------------------
# STAGE 03 - runner
# ------------------------------------
# Production image, copy all the files and run next
FROM base-prod AS runner
WORKDIR /app

# Arg to manage production state
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Arg to port for node
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# You only need to copy next.config.js if you are NOT using the default configuration
# COPY --from=builder /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD ["node", "server.js"]
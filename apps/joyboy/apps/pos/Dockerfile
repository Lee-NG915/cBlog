FROM node:20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
# install turbo
RUN yarn global add turbo
COPY . .
RUN turbo prune pos --docker


# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/nx.json ./
COPY --from=builder /app/tsconfig.base.json ./

#COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
COPY --from=builder /app/out/pnpm-lock.yaml ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Build the project
COPY --from=builder /app/out/full/ .
# build by nx
COPY --from=builder /app/nx.json ./
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm exec nx run pos:build


FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
COPY --from=installer /app/apps/pos/next.config.js .
COPY --from=installer /app/apps/pos/package.json .
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=installer --chown=nextjs:nodejs /app/apps/pos/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/dist/apps/pos/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/dist/apps/pos/.next/static ./apps/pos/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/dist/apps/pos/public ./apps/pos/public
 
# CMD node apps/pos/server.js
CMD ["node", "apps/pos/server.js"]
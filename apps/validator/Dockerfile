FROM node:18-alpine AS builder
WORKDIR /monorepo
RUN npm install -g turbo
COPY ./ ./
RUN turbo prune --scope=validator --docker

FROM node:18-alpine AS installer
WORKDIR /monorepo
COPY .gitignore .gitignore
COPY --from=builder /monorepo/out/json/ ./
COPY --from=builder /monorepo/out/package-lock.json ./package-lock.json
COPY --from=builder /monorepo/chains_rpc.json ./chains_rpc.json
RUN npm install
RUN npm install tr46
COPY --from=builder /monorepo/out/full/ ./
COPY --from=builder /monorepo/chains_rpc.json ./chains_rpc.json
COPY turbo.json turbo.json

FROM node:18-alpine AS runner
WORKDIR /monorepo
COPY --from=installer /monorepo ./
WORKDIR /monorepo/apps/validator
CMD npm run start
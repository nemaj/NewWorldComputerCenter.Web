FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY . .

FROM base AS api

ENV NODE_ENV=production
ENV PORT=4000

RUN npm run build -w apps/api

EXPOSE 4000
CMD ["npm", "run", "start", "-w", "apps/api"]

FROM base AS web

ARG NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
ENV NODE_ENV=production
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL

RUN npm run build -w apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "-w", "apps/web"]

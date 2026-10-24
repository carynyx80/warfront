FROM node:24-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --ignore-scripts --frozen-lockfile
COPY . .
RUN node scripts/build.js
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node","services/game-server/server.js"]

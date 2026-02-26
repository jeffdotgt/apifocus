FROM --platform=linux/amd64 ghcr.io/puppeteer/puppeteer:24.37.5

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production

CMD ["node", "server.js"]
FROM node:20-slim

# Install necessary facilities for puppeteer
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# working directory
WORKDIR /app

# Copy dependencies first (cache)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the project
COPY . .

# Cloud Run uses PORT
ENV PORT=8080
EXPOSE 8080

# Boot
CMD ["npm", "start"]
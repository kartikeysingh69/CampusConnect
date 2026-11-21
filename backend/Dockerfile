# Backend Production Dockerfile — CampusConnect
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root dependencies and install production packages
COPY package*.json ./
RUN npm install --omit=dev

# Copy backend source code
COPY backend ./backend
COPY .env ./

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
